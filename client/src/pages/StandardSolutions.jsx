import React, { useState, useEffect } from 'react';
import {
    ReactFlow,
    Background,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CircularNode, HalfCircleEdge } from './Assets/NodeEdge';
import '../style/StandardSolutions.css';
import { Link } from 'react-router-dom';
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

const StandardSolutions = () => {
    const [graphs, setGraphs] = useState([]);
    const [selectedGraph, setSelectedGraph] = useState(null);
    const [loading, setLoading] = useState(true); // Add loading state

    useEffect(() => {
        const fetchGraphs = async () => {
            try {
                const response = await fetch('/graphs', {
                    method: 'GET',
                });

                if (response.ok) {
                    const data = await response.json();
                    setGraphs(data.graphs);
                } else {
                    console.error('Failed to fetch graphs');
                }
            } catch (error) {
                console.error('Error fetching graphs:', error);
            } finally {
                setLoading(false); // Set loading to false after data is fetched
            }
        };

        fetchGraphs();
    }, []);

    const handleViewClick = (graph) => {
        setSelectedGraph(graph);
    };

    const handleCloseClick = () => {
        setSelectedGraph(null);
    };

    const renderGraph = (graph) => (
        <div style={{ width: '100%', height: '200px', marginTop: '20px' }}>
            <button onClick={handleCloseClick}>Close</button>
            <ReactFlow
                nodes={graph.graphData.nodes}
                edges={graph.graphData.edges}
                nodeTypes={{ circularNode: CircularNode }}
                edgeTypes={{ halfCircle: HalfCircleEdge }}
                fitView
            >
                <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
            <p>
                Is there any problem in analysis?{' '}
                <Link to={`/standardsolutions/givefeedback`} state={{ graphName: graph.name }}>
                    Give Feedback
                </Link>
            </p>
        </div>
    );

    return (
        <div className="sentences">
            {loading ? (
                // Show loading spinner while data is being fetched
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "60vh",
                    }}
                >
                    Loading... &nbsp;
                    <CircularProgress />
                </Box>
            ) : (
                graphs.map((graph, index) => (
                    <div key={index} className="solution" style={{ display: 'inline-block', marginRight: '10px' }}>
                        {/* Display graph name and date with a class for styling */}
                        <span className="date-display">{`${graph.name} (${new Date(graph.createdAt).toLocaleDateString()})`}</span>
                        {!selectedGraph || selectedGraph._id !== graph._id ? (
                            <button onClick={() => handleViewClick(graph)}>View</button>
                        ) : (
                            renderGraph(selectedGraph)
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default StandardSolutions;
