const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: String,
  googleId: String,
  name: String,
  email: String,
  role: String,
});

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;
