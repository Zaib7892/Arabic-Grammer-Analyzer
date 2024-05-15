import React, { useState } from 'react';
import { TiArrowBackOutline } from 'react-icons/ti';
import { useNavigate } from "react-router-dom";
import '../style/GiveFeedback.css';
import {ToastContainer, toast } from 'react-toastify';

const GiveFeedback = () => {
    const [feedback, setFeedback] = useState('');
    const [touched, setTouched] = useState(false); // State variable to track if textarea has been touched
    const history = useNavigate();

    const handleBack = () => {
        history("/standardsolutions");
    };

    const handleSubmit = () => {
        if (feedback.trim() !== '') {
            toast.success("Feedback Submitted!", {
                position: "top-center"
            });
            history("/standardsolutions");
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
                <h2>Give Feedback</h2>
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
            <ToastContainer/>
        </div>
        
    );
}

export default GiveFeedback;
