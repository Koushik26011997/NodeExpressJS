const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 6,
    max: 100,
  },
  email: {
    type: String,
    required: true,
    min: 6,
    max: 100,
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 1024,
  },
  dob: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  userImage: {
    type: String,
  },
  otp: {
    type: String,
    required: true,
    min: 4,
    max: 4,
  },
  status: {
    type: String,
    required: true,
    min: 10,
    max: 10,
  },
});

module.exports = mongoose.model("User", userSchema);
