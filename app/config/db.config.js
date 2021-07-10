const mongoose = require('mongoose');

const progress = require('../services/progress');

/**
 * Connect to the database and returns a promise
 * @return {Promise<Mongoose>}
 */
const connect = async () => {
  progress.start('Connecting to the database');

  if (!process.env.DB_URL) {
    progress.fail('Database connexion failed: DB_URL not found. Have you created the .env file?');
    process.exit(1);
  }

  return mongoose.connect(
    process.env.DB_URL,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  );
};

module.exports = { connect };
