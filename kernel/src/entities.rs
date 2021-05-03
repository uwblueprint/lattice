mod id;
mod meta;
mod prelude;
mod user;

pub use id::*;
pub use meta::*;
pub use user::*;

use prelude::*;

use ::bson::de::Result as BsonDeResult;
use ::bson::ser::Result as BsonSerResult;

use mongodb::error::Error as MongoError;

pub struct Context {
    pub database: Database,
}

#[async_trait]
pub trait Entity:
    Debug + Clone + Serialize + DeserializeOwned + Send + Unpin
{
    const COLLECTION_NAME: &'static str;

    fn collection(ctx: &Context) -> Collection<Document> {
        let name = Self::COLLECTION_NAME;
        ctx.database.collection(name)
    }

    fn find_by(filter: Document) -> FindOneQuery<Self> {
        FindOneQuery::new(filter)
    }

    fn find(id: ObjectId) -> FindOneQuery<Self> {
        Self::find_by(doc! { "_id": id })
    }

    fn to_document(&self) -> BsonSerResult<Document> {
        let mut doc = to_document(self)?;
        let id = doc.remove("id").expect("missing ID field");
        doc.insert("_id", id);
        Ok(doc)
    }

    fn from_document(mut doc: Document) -> BsonDeResult<Self> {
        let id = doc.remove("_id").expect("missing ID field");
        doc.insert("id", id);
        from_document(doc)
    }

    async fn save(&self, ctx: &Context) -> InsertResult {
        let collection = Self::collection(ctx);
        let doc = self.to_document()?;
        collection.insert_one(doc, None).await?;
        Ok(())
    }
}

pub type QueryResult<T> = Result<T, MongoError>;
pub type InsertResult = Result<(), MongoError>;

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
    phantom: PhantomData<T>,
}

impl<T: Entity> FindQuery<T> {
    pub async fn load(
        self,
        ctx: &Context,
    ) -> QueryResult<impl Stream<Item = QueryResult<T>>> {
        let collection = T::collection(ctx);
        let cursor = collection.find(self.filter, None).await?;
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

// impl,T> FindQuery<>
// impl<T>Query<T>
// where Cursor<T>: Entity
