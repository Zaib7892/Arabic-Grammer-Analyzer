import React, { useState, useEffect, useContext } from "react";
import { ReactFlow, Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { CircularNode, HalfCircleEdge } from "./Assets/NodeEdge";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { LoginContext } from "../components/ContextProvider/Context";
import "../style/ViewFeedback.css"

const ViewFeedback = () => {
  const { logindata } = useContext(LoginContext);
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await fetch("/feedbacks", { method: "GET" });
        if (response.ok) {
          const data = await response.json();
          setFeedbacks(data.feedbacks);
        } else {
          console.error("Failed to fetch feedbacks");
        }
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const handleViewClick = (feedback) => {
    setSelectedFeedback(feedback);
  };

  const handleCloseClick = () => {
    setSelectedFeedback(null);
  };

  const handleAcceptFeedback = async () => {
    if (!selectedFeedback) return;

    try {
        // Filter out edges with stroke 'red'
        const filteredEdges = selectedFeedback.graphData.edges.filter(
            (edge) => edge.style?.stroke !== "red"
        );

        // Update remaining edges' stroke to '#000000'
        const updatedGraphData = {
            ...selectedFeedback.graphData,
            edges: filteredEdges.map((edge) => ({
                ...edge,
                style: { ...edge.style, stroke: "#000000" },
            })),
        };

        const response = await fetch(`/updateSenGraph/${selectedFeedback.graphId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ graphData: updatedGraphData }),
        });

        if (response.ok) {
            const deleteResponse = await fetch(`/delfeedback/${selectedFeedback._id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            if (deleteResponse.ok) {
                toast.success("Feedback accepted and updated graph successfully!");
                setFeedbacks(feedbacks.filter((fb) => fb._id !== selectedFeedback._id));
                setSelectedFeedback(null);
            } else {
                toast.error("Failed to delete feedback.");
            }
        } else {
            const errorData = await response.json();
            toast.error(`Failed to accept feedback: ${errorData.message}`);
        }
    } catch (error) {
        console.error("Error accepting feedback:", error);
        toast.error("An error occurred while accepting feedback.");
    }
};

  

  const handleRejectFeedback = async () => {
    const deleteResponse = await fetch(`/delfeedback/${selectedFeedback._id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
  });

  if (deleteResponse.ok) {
      toast.success('Feedback Rejected!');
      setFeedbacks(feedbacks.filter((fb) => fb._id !== selectedFeedback._id));
      setSelectedFeedback(null);
  } else {
      toast.error('Failed to delete feedback.');
  }
    setSelectedFeedback(null);
  };

  const renderGraph = (feedback) => (
    <div style={{ width: "100%", height: "100%" }}>
      <div className="buttons">
        <button className="closebtn" onClick={handleCloseClick}>
          Close
        </button>
      </div>
      <div className="legend">
        <span className="legend-item">
          <span className="legend-bullet" style={{ backgroundColor: '#4467C4' }}></span>Added by user
        </span>
        <span className="legend-item">
          <span className="legend-bullet" style={{ backgroundColor: 'red' }}></span>Deleted by user
        </span>
      </div>

      <div
      style={{
        width: "100%",
        height: "200px", 
        border: "1px solid #ccc",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <ReactFlow
        nodes={feedback.graphData.nodes}
        edges={feedback.graphData.edges}
        nodeTypes={{ circularNode: CircularNode }}
        edgeTypes={{ halfCircle: HalfCircleEdge }}
        fitView
      >
        <Background variant="dots" gap={12} size={1} />
        <Controls />
      </ReactFlow>
    </div>
    <div className="actionbuttons">
  <button onClick={handleAcceptFeedback} className="accept-btn">
    ✔
  </button>
  <button onClick={handleRejectFeedback} className="reject-btn">
    ✖
  </button>
</div>
    </div>
  );

  return (
    <div className="standard-solutions-container">
       <ToastContainer />
      <div className="graph-display-area">
        {selectedFeedback ? (
          renderGraph(selectedFeedback)
          
        ) : (
          <div className="loading-container">
            <p>Select a feedback to view</p>
          </div>
        )}
      </div>
      <div className="graph-list">
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            Loading... &nbsp;
            <CircularProgress />
          </Box>
        ) : (
          feedbacks.map((feedback, index) => (
            <div key={index} className="solution">
              <button onClick={() => handleViewClick(feedback)}>View</button>
              <div className="solution-details">
                <span className="solution-name">{feedback.graphName}</span>
                <span className="feedback-message">
                Feedback: {feedback.feedback}
                </span>
                <span className="solution-date">
                  {new Date(feedback.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ViewFeedback;
