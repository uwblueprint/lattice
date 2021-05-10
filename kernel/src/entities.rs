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
use mongodb::options::{FindOptions, ReplaceOptions};

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

    fn find_by(filter: Document) -> FindOneQuery<Self> {
        FindOneQuery::new(filter)
    }

    fn find(id: &ObjectId) -> FindOneQuery<Self> {
        Self::find_by(doc! { "_id": id })
    }

    fn all() -> FindQuery<Self> {
        Self::filter(Document::default())
    }

    fn filter(filter: Document) -> FindQuery<Self> {
        FindQuery::new(filter)
    }

    async fn save(&self, ctx: &Context) -> SaveResult {
        let collection = Self::collection(ctx);
        let doc = self.to_document()?;
        let id = {
            let id = doc.get("_id").expect("missing `_id` field");
            id.as_object_id()
                .expect("`_id` field should be an ObjectId")
        };
        let options = ReplaceOptions::builder().upsert(true).build();
        collection
            .replace_one(doc! { "_id": id }, doc, options)
            .await?;
        Ok(())
    }

    async fn delete(&self, ctx: &Context) -> DeleteResult {
        let collection = Self::collection(ctx);
        let id = self.object_id();
        collection.delete_one(doc! { "_id": id }, None).await?;
        Ok(())
    }
}

pub type QueryResult<T> = Result<T, MongoError>;
pub type SaveResult = Result<(), MongoError>;
pub type DeleteResult = Result<(), MongoError>;

#[derive(Debug, Clone)]
pub struct FindOneQuery<T: Entity> {
    filter: Document,
    phantom: PhantomData<T>,
}

impl<T: Entity> FindOneQuery<T> {
    pub fn new(filter: Document) -> Self {
        Self {
            filter,
            phantom: PhantomData,
        }
    }

    pub async fn load(self, ctx: &Context) -> QueryResult<Option<T>> {
        let collection = T::collection(ctx);
        let doc = collection.find_one(self.filter, None).await?;
        let doc = match doc {
            Some(doc) => doc,
            None => return Ok(None),
        };
        let entity = T::from_document(doc)?;
        Ok(Some(entity))
    }
}

pub struct FindQuery<T: Entity> {
    filter: Document,
    options: FindOptions,
    phantom: PhantomData<T>,
}

impl<T: Entity> FindQuery<T> {
    pub fn new(filter: Document) -> Self {
        Self {
            filter,
            options: FindOptions::default(),
            phantom: PhantomData,
        }
    }

    pub async fn skip(&mut self, n: impl Into<Option<u32>>) -> &Self {
        self.options.skip = n.into().map(Into::into);
        self
    }

    pub async fn take(&mut self, n: impl Into<Option<u32>>) -> &Self {
        self.options.limit = n.into().map(Into::into);
        self
    }

    pub async fn load(
        self,
        ctx: &Context,
    ) -> QueryResult<impl Stream<Item = QueryResult<T>>> {
        let Self {
            filter, options, ..
        } = self;
        let collection = T::collection(ctx);
        let cursor = collection.find(filter, options).await?;
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
}
