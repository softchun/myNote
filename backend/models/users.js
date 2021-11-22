const mongoose = require("mongoose");

const collection = 'Users'

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  fav_notes: {
    type: Array
  }
},{
  timestamps: true,
  versionKey: false,
  collection
});

const Users = mongoose.model(collection, userSchema);

module.exports = Users;