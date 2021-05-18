mod prelude;

mod build;
mod membership;
mod meta;
mod user;

pub use build::*;
pub use membership::*;
pub use meta::*;
pub use user::*;

use prelude::*;

use ::bson::de::Result as BsonDeResult;
use ::bson::ser::Result as BsonSerResult;

use mongodb::error::Error as MongoError;
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

    fn global_id(&self) -> GlobalId {
        GlobalId::of(self)
    }

    fn to_document(&self) -> BsonSerResult<Document> {
        let mut doc = to_document(self)?;
        let id = doc.remove("id").expect("missing `id` field");
        doc.insert("_id", id);
        Ok(doc)
    }

    fn from_document(mut doc: Document) -> BsonDeResult<Self> {
        let id = doc.remove("_id").expect("missing `_id` field");
        doc.insert("id", id);
        from_document(doc)
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

pub type QueryResult<T> = Result<T, MongoError>;

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

    pub async fn load(self, ctx: &Context) -> QueryResult<Option<T>> {
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

    pub async fn exists(self, ctx: &Context) -> QueryResult<bool> {
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

    // pub fn and(conditions: impl Into<Document>)

    pub async fn skip(&mut self, n: impl Into<Option<u32>>) -> &Self {
        self.options.skip = n.into().map(Into::into);
        self
    }

    pub async fn take(&mut self, n: impl Into<Option<u32>>) -> &Self {
        self.options.limit = n.into().map(Into::into);
        self
    }

    pub async fn find(
        self,
        ctx: &Context,
    ) -> QueryResult<impl Stream<Item = QueryResult<T>>> {
        let Self {
            conditions,
            options,
            ..
        } = self;
        let collection = T::collection(ctx);
        let cursor = collection.find(conditions, options).await?;
        let stream = cursor.map(|doc| -> QueryResult<T> {
            let doc = match doc {
                Ok(doc) => doc,
                Err(error) => return Err(error),
            };
            let entity = T::from_document(doc)?;
            Ok(entity)
        });
        Ok(stream)
    }

    pub async fn count(self, ctx: &Context) -> QueryResult<i64> {
        let Self { conditions, .. } = self;
        let collection = T::collection(ctx);
        collection.count_documents(conditions, None).await
    }
}
