import React, { useState, useContext, useCallback } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import {
    ReactFlow,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CircularNode, HalfCircleEdge } from './Assets/NodeEdge';
import '../style/GiveFeedback.css';
import { ToastContainer, toast } from 'react-toastify';
import { LoginContext } from "../components/ContextProvider/Context";

const GiveFeedback = () => {
    const { logindata } = useContext(LoginContext);
    const [feedback, setFeedback] = useState('');
    const [touched, setTouched] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { graphName, fgraph } = location.state || {};

    const [nodes, setNodes, onNodesChange] = useNodesState(fgraph?.graphData?.nodes || []);
    const [edges, setEdges, onEdgesChange] = useEdgesState(fgraph?.graphData?.edges || []);
    const [tempEdges, setTempEdges] = useState(fgraph?.graphData?.edges || []);

    const isDuplicateEdge = (edge) => {
        return tempEdges.some((e) => e.source === edge.source && e.target === edge.target);
    };

    //edge addition
    const onConnect = useCallback(
        (params) => {
            const newEdge = {
                ...params,
                type: 'halfCircle',
                style: { stroke: '#4467C4', strokeWidth: 1.5 },
                markerEnd: { type: 'arrow', color: '#ff0072' },
            };

            // Adding edge to `edges`
            setEdges((eds) => addEdge(newEdge, eds));

            // Adding edge to `tempEdges` if not a duplicate
            if (!isDuplicateEdge(newEdge)) {
                setTempEdges((eds) => [...eds, newEdge]);
            }
        },
        [setEdges, tempEdges]
    );

    //edge deletion
    const onEdgeClick = useCallback(
        (event, edge) => {
            event.stopPropagation();
            setTempEdges((tEdges) =>
                tEdges.map((e) =>
                    e.id === edge.id
                        ? { ...e, style: { ...e.style, stroke: 'red' } }
                        : e
                )
            );
    
            // Remove the edge only from `edges`
            setEdges((eds) => eds.filter((e) => e.id !== edge.id));
        },
        [setEdges, setTempEdges]
    );
    

    const handleBack = () => {
        navigate("/standardsolutions");
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
                        userId: logindata.ValidUserOne?._id,
                        graphId: fgraph._id,
                        graphName,
                        feedback,
                        graphData: { nodes, edges: tempEdges }, // Store `tempEdges` here
                    })
                });

                if (response.ok) {
                    toast.success("Feedback Submitted!", {
                        position: "top-center",
                        autoClose: 2000
                    });

                    setTimeout(() => {
                        navigate("/standardsolutions");
                    }, 2000);
                } else if (response.status === 409) {
                    toast.error("You have already stored feedback for this graph", {
                        position: "top-center"
                    });
                    setTimeout(() => {
                        navigate("/standardsolutions");
                    }, 3000);
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

    const renderGraph = () => (
        <div className="graphContainer">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onEdgeClick={onEdgeClick}
                nodeTypes={{ circularNode: CircularNode }}
                edgeTypes={{ halfCircle: HalfCircleEdge }}
                fitView
            >
                <Background variant="dots" gap={12} size={1} />
                <Controls />
            </ReactFlow>
        </div>
    );

    return (
        <div className="feedbackContainer">
            <button className="backbtn" onClick={handleBack}>
                Back
            </button>
            <div className="feedback-heading">
                <h2>Give Feedback</h2>
            </div>
            <div className='name' style={{ color: '#1d4b78', fontSize: '24px' }}>
                {graphName}
            </div>

            {renderGraph()}
            <textarea
                className={`feedback-textarea ${touched && feedback.trim() === '' ? 'feedback-textarea-error' : ''}`}
                value={feedback}
                onChange={(e) => {
                    setFeedback(e.target.value);
                    setTouched(true);
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
