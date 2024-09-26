import React, { useState, useEffect, useContext } from 'react';
import { ReactFlow, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CircularNode, HalfCircleEdge } from './Assets/NodeEdge'; // Assuming you have custom nodes/edges
import '../style/StandardSolutions.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { LoginContext } from "../components/ContextProvider/Context";

const CreateTest = () => {
    const { logindata } = useContext(LoginContext);
    const [graphs, setGraphs] = useState([]);
    const [selectedGraph, setSelectedGraph] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGraphs = async () => {
            try {
                const response = await fetch('/graphs', { method: 'GET' });
                if (response.ok) {
                    const data = await response.json();
                    setGraphs(data.graphs);
                } else {
                    console.error('Failed to fetch graphs');
                }
            } catch (error) {
                console.error('Error fetching graphs:', error);
            } finally {
                setLoading(false);
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

    const testCreation = async (graph) => {
        try {
            const response = await fetch('/storetest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: logindata.ValidUserOne?._id,
                    graphId: graph._id,
                    name: graph.name,
                    graph: graph.graphData
                })
            });
            if (response.ok) {
                toast.success(`Test Created Successfully`, {
                    position: "top-center"
                });
            } else {
                toast.error("Failed to Create test", {
                    position: "top-center"
                });
            }
        } catch (error) {
            toast.error("An error occurred while storing test", {
                position: "top-center"
            });
        }
    };

    const renderGraph = (graph) => {
        return (
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
                <div className="create-test">
                    <button className='create-test-button' onClick={() => testCreation(graph)}>Create Test</button>
                </div>
                <ToastContainer />
            </div>
        );
    };

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
                        {/* Display graph name and date */}
                        <span>{`${graph.name} (${new Date(graph.createdAt).toLocaleDateString()})`}</span>
                        {selectedGraph && selectedGraph._id === graph._id ? (
                            // Display graph and hide "View" button when the graph is selected
                            <div>{renderGraph(selectedGraph)}</div>
                        ) : (
                            // Show "View" button when the graph is not selected
                            <button onClick={() => handleViewClick(graph)}>View</button>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default CreateTest;
