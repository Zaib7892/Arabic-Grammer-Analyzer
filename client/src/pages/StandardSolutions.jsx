import React, { useState, useEffect, useContext } from 'react';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CircularNode, HalfCircleEdge } from './Assets/NodeEdge';
import '../style/StandardSolutions.css';
import { Link } from 'react-router-dom';
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LoginContext } from "../components/ContextProvider/Context";

const StandardSolutions = () => {
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

    const renderGraph = (graph) => (
        <div style={{ width: '100%', height: '100%' }}>
            <div className='buttons'>
            <button className='closebtn' onClick={handleCloseClick}>Close</button>
            {logindata.ValidUserOne?.type === 'a' && (
                <button className='create-test-button' onClick={() => testCreation(graph)}>Create Test</button>
            )}
            </div>
            {logindata.ValidUserOne?.type === 'u' && (<div style={{ marginTop: '10px', textAlign: 'center' }}>
                <p>
                    Is there any problem in analysis?{' '}
                    <Link to={`/standardsolutions/givefeedback`} state={{ graphName: graph.name, fgraph: graph }}>
                        Give Feedback
                    </Link>
                </p>
            </div>)}
            <ReactFlow
                nodes={graph.graphData.nodes}
                edges={graph.graphData.edges}
                nodeTypes={{ circularNode: CircularNode }}
                edgeTypes={{ halfCircle: HalfCircleEdge }}
                fitView
            >
                <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
            <ToastContainer />
        </div>
    );

    return (
        <div className="standard-solutions-container">
            <div className="graph-display-area">
                {selectedGraph ? renderGraph(selectedGraph) : (
                    <div className="loading-container">
                        <p>Select a graph to view</p>
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
                    graphs.map((graph, index) => (
                        <div key={index} className="solution">
                            <button onClick={() => handleViewClick(graph)}>View</button>
                            <div className="solution-details">
                                <span className="solution-name">{graph.name}</span>
                                <span className="solution-date">{new Date(graph.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StandardSolutions;
