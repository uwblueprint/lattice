module.exports = {
  async up(db, client) {
    const users = db.collection("users");
    await users.updateMany({ created_at: { $type: "string" } }, [
      {
        $set: {
          created_at: {
            $dateFromString: {
              dateString: "$created_at",
            },
          },
          updated_at: {
            $dateFromString: {
              dateString: "$updated_at",
            },
          },
        },
      },
    ]);

    const memberRoles = db.collection("member_roles");
    await memberRoles.updateMany({ created_at: { $type: "string" } }, [
      {
        $set: {
          created_at: {
            $dateFromString: {
              dateString: "$created_at",
            },
          },
          updated_at: {
            $dateFromString: {
              dateString: "$updated_at",
            },
          },
        },
      },
    ]);

    const memberships = db.collection("memberships");
    await memberships.updateMany({ created_at: { $type: "string" } }, [
      {
        $set: {
          created_at: {
            $dateFromString: {
              dateString: "$created_at",
            },
          },
          updated_at: {
            $dateFromString: {
              dateString: "$updated_at",
            },
          },
          start: {
            $dateFromString: {
              dateString: "$start",
            },
          },
          end: {
            $dateFromString: {
              dateString: "$end",
            },
          },
        },
      },
    ]);
  },

  async down(db, client) {
    const users = db.collection("users");
    await users.updateMany({ created_at: { $type: "date" } }, [
      {
        $set: {
          created_at: {
            $dateToString: {
              date: "$created_at",
            },
          },
          updated_at: {
            $dateToString: {
              date: "$updated_at",
            },
          },
        },
      },
    ]);

    const memberRoles = db.collection("member_roles");
    await memberRoles.updateMany({ created_at: { $type: "date" } }, [
      {
        $set: {
          created_at: {
            $dateToString: {
              date: "$created_at",
            },
          },
          updated_at: {
            $dateToString: {
              date: "$updated_at",
            },
          },
        },
      },
    ]);

    const memberships = db.collection("memberships");
    await memberships.updateMany({ created_at: { $type: "date" } }, [
      {
        $set: {
          created_at: {
            $dateToString: {
              date: "$created_at",
            },
          },
          updated_at: {
            $dateToString: {
              date: "$updated_at",
            },
          },
          start: {
            $dateToString: {
              date: "$start",
            },
          },
          end: {
            $dateToString: {
              date: "$end",
            },
          },
        },
      },
    ]);
  },
};
