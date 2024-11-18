import React, { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import '../style/ViewFeedback.css';

const ViewFeedback = () => {
  const [loading, setLoading] = useState(true); // Loading state
  const [feedbackData, setFeedbackData] = useState([]); // State for feedback data

  // Fetch feedback data
  useEffect(() => {
    const fetchFeedbackData = async () => {
      try {
        const response = await fetch('/feedbacks'); // Make sure the endpoint is correct
        const result = await response.json();

        if (response.ok) {
          setFeedbackData(result.feedbacks); // Assuming the response contains feedbacks
        } else {
          console.error("Error fetching feedbacks:", result.error);
        }
      } catch (error) {
        console.error("Error occurred while fetching feedbacks:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    fetchFeedbackData();
  }, []);

  return (
    <div className="feedback-container">
      {loading ? (
        // Show loading spinner while data is being fetched
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          Loading... &nbsp;
          <CircularProgress />
        </Box>
      ) : (
        <div className="feedback-content">
          <h2 className="feedback-header">Feedbacks on Grammatical Analysis</h2>
          {feedbackData.length > 0 ? (
            feedbackData.map((feedback, index) => (
              <div key={index} className="feedback-item">
                <p className="sentence">
                  <strong>Sentence :</strong> {feedback.graphName}
                </p>
                <p className="feedback">
                  <strong>Feedback:</strong> {feedback.feedback}
                </p>
              </div>
            ))
          ) : (
            <p className="no-feedback">No feedback available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewFeedback;
