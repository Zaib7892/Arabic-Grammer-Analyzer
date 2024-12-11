import React, { useState, useEffect, useContext, useCallback } from 'react';
import { LoginContext } from '../components/ContextProvider/Context';
import {
    ReactFlow,
    Background,
    addEdge,
    useEdgesState,
    useNodesState,
    ReactFlowProvider, 
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { RectangularNode, ProjectileEdge } from './Assets/NodeEdge';
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

const nodeTypes = {
    rectangularNode: RectangularNode,
};

const edgeTypes = {
    projectileEdge: ProjectileEdge,
};

function SemanticSolutions() {
    const { logindata } = useContext(LoginContext);
    const [sem_graphs, setSemGraphs] = useState([]);
    const [selectedsemGraph, setSelectedSemGraph] = useState(null);
    const [loading, setLoading] = useState(true);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [hasChanges, setHasChanges] = useState(false); 


    const fetchUserGraphs = async () => {
        try {
            const response = await fetch(`/getUserGraphs?userId=${logindata.ValidUserOne._id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setSemGraphs(data);
            } else {
                console.log('Failed to fetch graphs');
            }
        } catch (error) {
            console.error('Error fetching graphs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserGraphs();
    }, [logindata]);

    const handleViewClick = (graph) => {
        setSelectedSemGraph(graph);
        setNodes(graph.nodes);
        setEdges(graph.edges);
    };

    const handleCloseClick = () => {
        setSelectedSemGraph(null);
    };

    // Callback to handle connecting edges and setting hasChanges to true
    const onConnect = useCallback(
        (params) => {
            setEdges((eds) => addEdge({ ...params, type: 'projectileEdge' }, eds));
            setHasChanges(true); // Mark changes as unsaved
        },
        [setEdges]
    );

    // Callback to handle deleting edges and setting hasChanges to true
    const onEdgeClick = (event, edge) => {
        event.stopPropagation();
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
        setHasChanges(true); // Mark changes as unsaved
    };

    // Handle saving the changes to the backend
    const handleSaveChanges = async () => {
        try {
            const response = await fetch(`/updateSemGraph/${selectedsemGraph._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ edges }), // Send the updated edges to the backend
            });

            if (response.ok) {
                const updatedGraph = await response.json();
                console.log('Graph updated:', updatedGraph);
                setHasChanges(false); // Reset change tracking after successful save
                fetchUserGraphs();
            } else {
                console.error('Failed to save changes');
            }
        } catch (error) {
            console.error('Error saving changes:', error);
        }
    };

    const renderGraph = () => (
        <div style={{ width: '100%', height: '400px', marginTop: '20px' }}>
            <button onClick={handleCloseClick}>Close</button>
            <ReactFlowProvider>
                {/* Wrap ReactFlow with ReactFlowProvider */}
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onEdgeClick={onEdgeClick}
                    fitView
                >
                    <Background variant="dots" gap={12} size={1} />
                </ReactFlow>
            </ReactFlowProvider>

            {/* Show "Save Changes" button if there are unsaved changes */}
            {hasChanges && (
                <button onClick={handleSaveChanges} style={{ marginTop: '10px' }}>
                    Save Changes
                </button>
            )}
        </div>
    );

    return (
        <div className="sentences">
            {loading ? (
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
                sem_graphs.map((graph, index) => (
                    <div
                        key={index}
                        className="solution"
                        style={{
                            display: 'flex', // Use flexbox for alignment
                            alignItems: 'flex-start', // Align items to the top
                            marginBottom: '15px', // Add spacing between items
                            padding: '15px', // Add padding for visual clarity
                            border: '1px solid #ccc', // Optional: border for each box
                            borderRadius: '8px', // Optional: rounded corners
                            backgroundColor: '#f9f9f9', // Optional: light background color
                        }}
                    >
                        {/* View Button on the left */}
                        <button
                            onClick={() =>
                                selectedsemGraph && selectedsemGraph._id === graph._id
                                    ? handleCloseClick()
                                    : handleViewClick(graph)
                            }
                            style={{
                                marginRight: '15px', // Space between button and content
                                padding: '10px 20px', // Button padding
                                borderRadius: '8px', // Rounded corners
                                backgroundColor: '#1d4b78', // Button background
                                color: 'white', // Button text color
                                border: 'none', // Remove default border
                                cursor: 'pointer', // Add pointer cursor
                                fontWeight: 'bold', // Make button text bold
                              
                            }}
                        >
                            {!selectedsemGraph || selectedsemGraph._id !== graph._id ? 'View' : 'Close'}
                        </button>
    
                        {/* Display Arabic Text and Date */}
                        <div style={{ flex: 1 }}>
                            <span className="date-display" style={{ display: 'block', marginBottom: '10px' ,textAlign:'right'}}>
                                {`${graph.arabicText} (${new Date(graph.createdAt).toLocaleDateString()})`}
                            </span>
    
                            {/* Conditionally render the graph */}
                            {selectedsemGraph && selectedsemGraph._id === graph._id && (
                                <div style={{ marginTop: '20px', width: '100%' }}>
                                    {renderGraph()}
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
    
}

export default SemanticSolutions;
