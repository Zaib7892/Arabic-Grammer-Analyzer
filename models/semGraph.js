const mongoose = require('mongoose');

const semGraphSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users", // Reference to the user schema
    required: true
  },
  arabicText: {
    type: String,
    required: true,
  },
  nodes: {
    type: Object, // Storing as a JSON object
    required: true
  },
  edges: {
    type: Object, // Storing as a JSON object
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const semGraph = mongoose.model('semGraph', semGraphSchema);

module.exports = semGraph;
