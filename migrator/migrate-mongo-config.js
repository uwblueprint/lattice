const dotenv = require("dotenv");
dotenv.config();

const { LATTICE_DATABASE_URI, LATTICE_DATABASE_NAME } = process.env;

const config = {
  mongodb: {
    url: LATTICE_DATABASE_URI || "mongodb://localhost:27017",
    databaseName: LATTICE_DATABASE_NAME || "lattice",
    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
      useUnifiedTopology: true, // removes a deprecating warning when connecting
      //   connectTimeoutMS: 3600000, // increase connection timeout to 1 hour
      //   socketTimeoutMS: 3600000, // increase socket timeout to 1 hour
    },
  },
  migrationsDir: "migrations",
  changelogCollectionName: "migrations",
  migrationFileExtension: ".js",
  useFileHash: false,
};

module.exports = config;
