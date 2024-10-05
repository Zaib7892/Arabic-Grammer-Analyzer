import React, { useState, useEffect, useContext, useCallback } from 'react';
import { ReactFlow, Background, useNodesState, useEdgesState, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CircularNode, HalfCircleEdge } from './Assets/NodeEdge';
import '../style/Test.css';
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

    // Add state for nodes and edges
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

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
        setNodes(graph.graphData.nodes);
    };

    const handleCloseClick = () => {
        const confirmQuit = window.confirm('Are you sure you want to quit the test?');
        if (confirmQuit) {
            setSelectedGraph(null);
            setNodes([]);
            setEdges([]);
        }
    };

    // Add onConnect for adding new edges
    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge({ ...params, type: 'halfCircle', style: { stroke: '#000000', strokeWidth: 1.5 }, markerEnd: { type: 'arrow', color: '#ff0072' } }, eds)),
        [setEdges]
    );

    // Add callback for deleting edges on click
    const onEdgeClick = useCallback(
        (event, edge) => {
            event.stopPropagation();
            setEdges((eds) => eds.filter((e) => e.id !== edge.id));
        },
        [setEdges]
    );

    const testCreation = async () => {
        if (!selectedGraph) return; // Ensure a graph is selected

        /*try {
            const response = await fetch('/storetest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: logindata.ValidUserOne?._id,
                    graphId: selectedGraph._id,
                    name: selectedGraph.name,
                    graph: selectedGraph.graphData
                })
            });
            if (response.ok) {
                toast.success('Test Created Successfully', {
                    position: "top-center"
                });
                handleCloseClick(); // Close the test view after successful creation
            } else {
                toast.error('Failed to Create test', {
                    position: "top-center"
                });
            }
        } catch (error) {
            toast.error('An error occurred while storing test', {
                position: "top-center"
            });
        }*/
    };

    const renderGraph = () => {
        if (!selectedGraph) return null;

        return (
            <div style={{ width: '100%', height: '400px', marginTop: '20px' }}>
                <div style={{ textAlign: 'center',
                     fontSize: '24px',
                     fontWeight: 'bold', 
                     marginBottom: '10px', 
                     border:'1px solid #ccc',
                     color:'#1d4b78',
                     padding: '10px', 
                     borderRadius: '15px',
                     boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', }}>
                    {selectedGraph.name}
                </div>
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
                </ReactFlow>
                <div className="test-buttons">
                    <button className='submit' onClick={testCreation}>Submit Test</button>
                    <button className='quit' onClick={handleCloseClick}>Quit Test</button>
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
            ) : selectedGraph ? (
                // Render only the selected graph when one is clicked
                <div>{renderGraph()}</div>
            ) : (
                // Render the full list of graphs if no graph is selected
                graphs.map((graph) => (
                    <div key={graph._id} className="graphs">
                        <button className='taketest' onClick={() => handleViewClick(graph)}>Take Test</button>
                        <div className="graph-info">
                            <span className="graph-name">{graph.name}</span>
                            <div className="date">{new Date(graph.createdAt).toLocaleDateString()}</div>
                        </div>
                        
                    </div>
                ))
            )}
        </div>
    );
};

export default CreateTest;
