const mongoose = require("mongoose");

const collection = 'Notes'

const noteSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String
  },
  color: {
    type: String
  },
  privacy: {
    type: String
  },
  deleted: {
    type: String
  }
},{
  timestamps: true,
  versionKey: false,
  collection
});

const Notes = mongoose.model(collection, noteSchema);

module.exports = Notes;