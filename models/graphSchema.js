const mongoose = require("mongoose");

const graphSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users", // Reference to the user schema
        required: true
    },
    name: {
        type: String,
        required: true
    },
    graphData: {
        type: Object, // Storing the graph as a JSON object
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create the Graph model
const Graph = mongoose.model("graphs", graphSchema);

module.exports = Graph;
