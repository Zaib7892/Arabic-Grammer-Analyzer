const mongoose = require("mongoose");

const graphFeedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users", // Reference to the user schema
        required: true
    },
    graphName: {
        type: String,
        required: true
    },
    feedback: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create the GraphFeedback model
const GraphFeedback = mongoose.model("GraphFeedback", graphFeedbackSchema);
module.exports = GraphFeedback;
