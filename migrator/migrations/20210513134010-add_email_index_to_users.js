module.exports = {
  async up(db, client) {
    const users = db.collection("users");
    return users.createIndex(
      { email: 1 },
      { name: "email", unique: true, background: true }
    );
  },

  async down(db, client) {
    const users = db.collection("users");
    return users.dropIndex("email");
  },
};
