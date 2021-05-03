use lattice_kernel as lattice;

use lattice::entities::User;
use lattice::entities::{Context, Entity, ObjectId};

use anyhow::Context as AnyhowContext;
use anyhow::Result;

use mongodb::options::ClientOptions;
use mongodb::Client;

use chrono::Utc;

#[tokio::main]
async fn main() -> Result<()> {
    let ctx = {
        let options = ClientOptions::parse("mongodb://localhost:27017").await?;
        let client = Client::with_options(options)
            .context("failed to build MongoDB client")?;
        let database = client.database("lattice");
        Context { database }
    };

    let user1 = {
        let now = Utc::now();
        let user = User {
            id: ObjectId::new(),
            created_at: now,
            updated_at: now,

            firebase_id: "abcd1234".to_owned(),
            email: "steven.xie@uwblueprint.org".to_owned(),
        };
        user.save(&ctx).await.context("failed to save user")?;
        user
    };

    let user2 = {
        let user: Option<User> = User::find_by_firebase_id("abcd1234")
            .load(&ctx)
            .await
            .context("failed to load user")?;
        user.context("user not found")?
    };

    println!("user1.id: {}, user2.id: {}", &user1.id, &user2.id);
    Ok(())
}
