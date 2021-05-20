module.exports = {
  async up(db, client) {
    const memberships = await db.collection("memberships");
    await memberships.updateMany(
      {
        user_id: { $exists: 1 },
        role_id: { $exists: 1 },
      },
      [
        {
          $set: {
            "user.id": "$user_id",
            "role.id": "$role_id",
          },
        },
        {
          $unset: ["user_id", "role_id"],
        },
      ]
    );
  },

  async down(db, client) {
    const memberships = await db.collection("memberships");
    await memberships.updateMany(
      { user: { $exists: 1 }, role: { $exists: 1 } },
      [
        { $set: { user_id: "$user.id", role_id: "$role.id" } },
        { $unset: ["user", "role"] },
      ]
    );
  },
};
