const mongoose = require('mongoose');

const progress = require('../services/progress');
/**
 * Connect to the database and returns a promise
 * @return {Promise<Mongoose>}
 */
const connect = async () => {
  progress.text = 'Loading database';
  return mongoose.connect(
    process.env.MONGO_URL,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  );
};

module.exports = { connect };
