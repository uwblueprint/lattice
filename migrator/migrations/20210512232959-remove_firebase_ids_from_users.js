module.exports = {
  async up(db, client) {
    const users = db.collection("users");
    return users.updateMany(
      {
        firebase_id: { $exists: true },
      },
      {
        $unset: {
          firebase_id: 1,
        },
      }
    );
  },

  async down(db, client) {},
};
