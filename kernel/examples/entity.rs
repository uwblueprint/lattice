use lattice_kernel as lattice;

use chrono::Utc;

use anyhow::Context as AnyhowContext;
use anyhow::Result;

use mongodb::options::ClientOptions;
use mongodb::Client;

use std::thread::sleep;
use std::time::Duration;

use lattice::entities::*;

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
        let user = User::builder()
            .firebase_id("abcd1234")
            .email("steven.xie@uwblueprint.org")
            .first_name("Steven")
            .last_name("Xie")
            .build();
        user.save(&ctx).await.context("failed to save user")?;
        user
    };

    let user2 = {
        let user: Option<User> = User::find(&user1.id)
            .load(&ctx)
            .await
            .context("failed to load user")?;
        user.context("user not found")?
    };

    println!("user1.id: {}, user2.id: {}", &user1.id, &user2.id);
    Ok(())
}
