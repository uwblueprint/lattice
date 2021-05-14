module.exports = {
  async up(db, client) {
    const users = db.collection("users");
    return users.createIndex(
      { first_name: "text", last_name: "text" },
      { name: "text" }
    );
  },
  async down(db, client) {
    const users = db.collection("users");
    return users.dropIndex("text");
  },
};
