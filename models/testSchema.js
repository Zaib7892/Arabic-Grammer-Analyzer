const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users", // Reference to the users collection
        required: true
    },
    name: {
        type: String,
        required: true
    },
    graphId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "graphs", // Reference to the graphs collection
        required: true
    },
    graph:{
        type: Object, // Storing the graph as a JSON object
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create the Test model
const Test = mongoose.model("tests", testSchema);

module.exports = Test;
