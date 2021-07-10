const mongoose = require('mongoose');

const progress = require('../services/progress');

progress.start('Connecting to the database');

if (!process.env.DB_URL) {
  progress.fail('Database connexion failed: DB_URL not found. Have you created the .env file?');
  process.exit(1);
}

mongoose.connect(
  process.env.DB_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
)
  .catch((error) => {
    progress.fail(`Database connexion error: ${error}`);
    process.exit(1);
  });

module.exports = mongoose.connection;
