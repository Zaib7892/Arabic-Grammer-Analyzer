import React, { useState, useContext } from 'react';
import { TiArrowBackOutline } from 'react-icons/ti';
import { useNavigate, useLocation } from "react-router-dom";
import '../style/GiveFeedback.css';
import { ToastContainer, toast } from 'react-toastify';
import { LoginContext } from "../components/ContextProvider/Context";

const GiveFeedback = () => {
    const { logindata } = useContext(LoginContext);
    const [feedback, setFeedback] = useState('');
    const [touched, setTouched] = useState(false); // State variable to track if textarea has been touched
    const history = useNavigate();
    const location = useLocation();
    const { graphName } = location.state || {}; // Get the graphId from the state
    console.log('Received graphName:', graphName);

    const handleBack = () => {
        history("/standardsolutions");
    };

    const handleSubmit = async () => {
        if (feedback.trim() !== "") {
            try {
                const response = await fetch('/storefeedback', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        userId:logindata.ValidUserOne?._id,
                        graphName,
                        feedback 
                    })
                });

                if (response.ok) {
                    toast.success("Feedback Submitted!", {
                        position: "top-center",
                        autoClose: 2000 // Close after 2 seconds (adjust as needed)
                    });

                    // Use setTimeout to delay navigation
                    setTimeout(() => {
                        history("/standardsolutions");
                    }, 2000); // Delay for 2 seconds (match toast duration)
                } else {
                    toast.error("Failed to submit feedback.", {
                        position: "top-center"
                    });
                }
            } catch (error) {
                toast.error("An error occurred while submitting feedback.", {
                    position: "top-center"
                });
            }
        } else {
            toast.error("Kindly Enter Feedback.", {
                position: "top-center"
            });
        }
    };

    return (
        <div className="feedback-container">
            <div>
                <button className="back-button" onClick={handleBack}>
                    <TiArrowBackOutline size={24} />
                </button>
            </div>
            <div className="feedback-heading">
                <h2>Give Feedback </h2>
            </div>
            <textarea
                className={`feedback-textarea ${touched && feedback.trim() === '' ? 'feedback-textarea-error' : ''}`} // Add error class if touched and feedback is empty
                value={feedback}
                onChange={(e) => {
                    setFeedback(e.target.value);
                    setTouched(true); // Mark textarea as touched on change
                }}
                placeholder="Enter your feedback here..."
            />
            <button className="submit-button" onClick={handleSubmit}>
                Submit Feedback 
            </button>
            <ToastContainer />
        </div>
    );
};

export default GiveFeedback;
