module.exports = (error, res) => {
  // Duplicate key
  if (error.code === 11000) {
    res.status(409);
  }

  // Validation Error
  if (error.name === 'ValidationError') {
    res.status(422);
  }

  res.json({ error: error.toString() });
};
