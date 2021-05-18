module.exports = {
  async up(db, client) {
    const memberships = db.collection("memberships");
    await memberships.createIndex({ user_id: 1 }, { name: "user_id" });
    await memberships.createIndex({ role_id: 1 }, { name: "role_id" });
  },

  async down(db, client) {
    const memberships = db.collection("memberships");
    await memberships.dropIndex("user_id");
    await memberships.dropIndex("role_id");
  },
};
