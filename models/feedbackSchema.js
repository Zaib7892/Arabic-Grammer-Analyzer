const mongoose = require("mongoose");

const graphFeedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    graphId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "graphs",
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
    graphData: {
        type: Object, 
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
