import React, { useState, useEffect, useContext, useCallback } from 'react';
import { MdDelete } from "react-icons/md";
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
        setHasChanges(false);
    };

    // Callback to handle connecting edges and setting hasChanges to true
    const onConnect = useCallback(
        (params) => {
            setEdges((eds) => addEdge({ ...params, type: 'projectileEdge',markerEnd: { type: "arrow", color: "#ff0072",strokeWidth: '2.4'} }, eds));
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
    const handleDeleteGraph = async () => {
        if (!selectedsemGraph) return;
    
        const confirmDelete = window.confirm("Are you sure you want to delete this graph?");
        if (!confirmDelete) return;
    
        try {
            const response = await fetch(`/deleteSemGraph/${selectedsemGraph._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (response.ok) {
                console.log("Graph deleted successfully");
                setSelectedSemGraph(null);
                setSemGraphs((prevGraphs) => prevGraphs.filter(graph => graph._id !== selectedsemGraph._id));
                fetchUserGraphs();
            } else {
                console.error("Failed to delete graph");
            }
        } catch (error) {
            console.error("Error deleting graph:", error);
        }
    };
    
    const renderGraph = () => (
        <div style={{ width: '100%', height: '400px', marginTop: '20px', position: 'relative' }}>
            <ReactFlowProvider>
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
    
            {/* Conditionally render Save or Delete button */}
            {hasChanges ? (
                <button
                    onClick={handleSaveChanges}
                    style={{
                        position: 'relative',
                        top: '-37px', // Adjust upward relative to the graph
                        left: '-90px', // Align to the left
                        backgroundColor: '#1d4b78',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1em',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    Save Changes
                </button>
            ) : (
                <button
                    onClick={handleDeleteGraph}
                    style={{
                        position: 'relative',
                        top: '-37px', 
                        left: '90px', 
                        backgroundColor: '#1d4b78',
                        color: 'white',
                        padding: '10px 15px',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1.2em',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                >
                   <MdDelete />
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
            ) : sem_graphs.length === 0 ? (
                // Fallback message when there are no graphs
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '60vh',
                        textAlign: 'center',
                        color: '#555',
                        fontSize: '1.2em',
                    }}
                >
                    No graphs found. Start by saving your first semantic graph.
                </div>
            ) : (
                sem_graphs.map((graph, index) => (
                    <div
                        key={index}
                        className="solution"
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            marginBottom: '15px',
                            padding: '15px',
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            backgroundColor: '#f9f9f9',
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
                                marginRight: '15px',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                backgroundColor: '#1d4b78',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                            }}
                        >
                            {!selectedsemGraph || selectedsemGraph._id !== graph._id ? 'View' : 'Close'}
                        </button>
    
                        {/* Display Arabic Text and Date */}
                        <div style={{ flex: 1 }}>
                            <span className="date-display" style={{ display: 'block', marginBottom: '10px', textAlign: 'right' }}>
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
