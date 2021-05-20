mod prelude;

mod build;
mod date;
mod membership;
mod meta;
mod user;

pub use build::*;
pub use membership::*;
pub use meta::*;
pub use user::*;

use prelude::*;

use mongodb::options::{FindOneOptions, FindOptions, ReplaceOptions};

pub struct Context {
    database: Database,
}

impl Context {
    pub fn new(database: Database) -> Self {
        Self { database }
    }
}

pub trait Object:
    Debug + Clone + Serialize + DeserializeOwned + Send + Unpin
{
    const OBJECT_TYPE: ObjectType;

    fn object_id(&self) -> ObjectId;

    fn object_ref(&self) -> ObjectRef {
        let id = self.object_id();
        ObjectRef::new(id)
    }

    fn global_id(&self) -> GlobalId {
        GlobalId::of(self)
    }

    fn to_document(&self) -> Result<Document> {
        let mut doc = to_document(self)?;

        // Normalize ID field.
        let id = doc.remove("id").expect("missing `id` field");
        doc.insert("_id", id);

        // Normalize created-at timestamp.
        if let Some(created_at) = doc.get("created_at") {
            if let Bson::String(created_at) = created_at {
                let created_at: DateTime = created_at
                    .parse()
                    .context("failed to parse created-at timestamp")?;
                doc.insert("created_at", Bson::DateTime(created_at));
            }
        };

        // Normalize updated-at timestamp.
        if let Some(updated_at) = doc.get("updated_at") {
            if let Bson::String(updated_at) = updated_at {
                let updated_at: DateTime = updated_at
                    .parse()
                    .context("failed to parse updated-at timestamp")?;
                doc.insert("updated_at", Bson::DateTime(updated_at));
            }
        };

        Ok(doc)
    }

    fn from_document(mut doc: Document) -> Result<Self> {
        // Normalize ID field.
        let id = doc.remove("_id").expect("missing `_id` field");
        doc.insert("id", id);

        // Normalize created-at timestamp.
        if let Some(created_at) = doc.get("created_at") {
            if let Bson::DateTime(created_at) = created_at {
                let created_at = created_at.to_string();
                doc.insert("created_at", Bson::String(created_at));
            }
        };

        // Normalize updated-at timestamp.
        if let Some(updated_at) = doc.get("updated_at") {
            if let Bson::DateTime(updated_at) = updated_at {
                let updated_at = updated_at.to_string();
                doc.insert("updated_at", Bson::String(updated_at));
            }
        };

        let object = from_document(doc)?;
        Ok(object)
    }
}

#[async_trait]
pub trait Entity: Object {
    const COLLECTION_NAME: &'static str;

    fn collection(ctx: &Context) -> Collection<Document> {
        let name = Self::COLLECTION_NAME;
        ctx.database.collection(name)
    }

    fn find_by(conditions: impl Into<Document>) -> FindOneQuery<Self> {
        FindOneQuery::new(conditions)
    }

    fn find(id: &ObjectId) -> FindOneQuery<Self> {
        Self::find_by(doc! { "_id": id })
    }

    fn all() -> FindQuery<Self> {
        Self::filter(Document::new())
    }

    fn filter(conditions: impl Into<Document>) -> FindQuery<Self> {
        FindQuery::new(conditions)
    }

    async fn save(&mut self, ctx: &Context) -> Result<()> {
        self.before_save(ctx).await?;
        let collection = Self::collection(ctx);
        let doc = self.to_document()?;
        let id = self.object_id();
        let options = ReplaceOptions::builder().upsert(true).build();
        collection
            .replace_one(doc! { "_id": id }, doc, options)
            .await?;
        self.after_save(ctx).await?;
        Ok(())
    }

    async fn before_save(&mut self, _: &Context) -> Result<()> {
        Ok(())
    }

    async fn after_save(&mut self, _: &Context) -> Result<()> {
        Ok(())
    }

    async fn delete(&mut self, ctx: &Context) -> Result<()> {
        self.before_delete(ctx).await?;
        let collection = Self::collection(ctx);
        let id = self.object_id();
        collection.delete_one(doc! { "_id": id }, None).await?;
        self.after_delete(ctx).await?;
        Ok(())
    }

    async fn before_delete(&mut self, _: &Context) -> Result<()> {
        Ok(())
    }

    async fn after_delete(&mut self, _: &Context) -> Result<()> {
        Ok(())
    }
}

#[derive(Debug, Clone)]
pub struct FindOneQuery<T: Entity> {
    conditions: Document,
    options: FindOneOptions,
    phantom: PhantomData<T>,
}

impl<T: Entity> FindOneQuery<T> {
    pub fn new(conditions: impl Into<Document>) -> Self {
        let conditions: Document = conditions.into();
        Self {
            conditions,
            options: FindOneOptions::default(),
            phantom: PhantomData,
        }
    }

    pub async fn load(self, ctx: &Context) -> Result<Option<T>> {
        let Self {
            conditions,
            options,
            ..
        } = self;
        let collection = T::collection(ctx);
        let doc = collection.find_one(conditions, options).await?;
        let doc = match doc {
            Some(doc) => doc,
            None => return Ok(None),
        };
        let entity = T::from_document(doc)?;
        Ok(Some(entity))
    }

    pub async fn exists(self, ctx: &Context) -> Result<bool> {
        let Self { conditions, .. } = self;
        let collection = T::collection(ctx);
        let count = collection.count_documents(conditions, None).await?;
        Ok(count > 0)
    }
}

pub struct FindQuery<T: Entity> {
    conditions: Document,
    options: FindOptions,
    phantom: PhantomData<T>,
}

impl<T: Entity> FindQuery<T> {
    pub fn new(conditions: impl Into<Document>) -> Self {
        let mut options = FindOptions::default();
        let conditions: Document = conditions.into();
        if conditions.get("$text").is_some() {
            let sort = doc! { "score": { "$meta": "textScore" } };
            options.sort = Some(sort);
        }
        Self {
            conditions,
            options,
            phantom: PhantomData,
        }
    }

    pub fn skip(mut self, n: impl Into<Option<u32>>) -> Self {
        let n: Option<u32> = n.into();
        self.options.skip = n.map(Into::into);
        self
    }

    pub fn take(mut self, n: impl Into<Option<u32>>) -> Self {
        let n: Option<u32> = n.into();
        self.options.limit = n.map(Into::into);
        self
    }

    pub fn sort<D, S>(mut self, sorting: S) -> Self
    where
        D: Into<Document>,
        S: Into<Option<D>>,
    {
        let existing = self.options.sort.take();
        let incoming: Option<D> = sorting.into();
        self.options.sort = incoming.map(|incoming| {
            let incoming: Document = incoming.into();
            match existing {
                Some(mut existing) => {
                    for (key, value) in incoming {
                        existing.insert(key, value);
                    }
                    existing
                }
                None => incoming,
            }
        });
        self
    }

    pub async fn find(
        self,
        ctx: &Context,
    ) -> Result<impl Stream<Item = Result<T>>> {
        let Self {
            conditions,
            options,
            ..
        } = self;
        let collection = T::collection(ctx);
        let cursor = collection.find(conditions, options).await?;
        let stream = cursor.map(|doc| -> Result<T> {
            let doc = match doc {
                Ok(doc) => doc,
                Err(error) => return Err(error.into()),
            };
            let entity = T::from_document(doc)?;
            Ok(entity)
        });
        Ok(stream)
    }

    pub async fn count(self, ctx: &Context) -> Result<i64> {
        let Self { conditions, .. } = self;
        let collection = T::collection(ctx);
        let count = collection.count_documents(conditions, None).await?;
        Ok(count)
    }
}

#[derive(Debug, Clone, Copy, Hash, PartialEq, Eq, Serialize, Deserialize)]
pub enum SortingOrder {
    Asc,
    Desc,
}

impl Default for SortingOrder {
    fn default() -> Self {
        Self::Asc
    }
}

impl From<SortingOrder> for Bson {
    fn from(order: SortingOrder) -> Self {
        use SortingOrder::*;
        match order {
            Asc => Bson::Int32(1),
            Desc => Bson::Int32(-1),
        }
    }
}

impl From<Bson> for SortingOrder {
    fn from(bson: Bson) -> Self {
        use SortingOrder::*;
        match bson {
            Bson::Int32(1) => Asc,
            Bson::Int32(-1) => Desc,
            other => panic!("invalid sorting order: {}", other),
        }
    }
}
