const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: String,
  googleId: String,
  name: String,
  email: String,
  role: String,
  status: { type: String, default: 'newUser' },
});

// TODO: document valid user statuses or use enums

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;
