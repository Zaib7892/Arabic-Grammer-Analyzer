import React, { useState, useEffect, useContext, useCallback } from 'react';
import { ReactFlow, Background, useNodesState, useEdgesState, addEdge, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CircularNode, HalfCircleEdge } from './Assets/NodeEdge';
import '../style/Test.css';
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from '@mui/material/LinearProgress'; // Import LinearProgress
import Box from "@mui/material/Box";
import { LoginContext } from "../components/ContextProvider/Context";

const Test = () => {
    const { logindata } = useContext(LoginContext);
    const [graphs, setGraphs] = useState([]);
    const [selectedGraph, setSelectedGraph] = useState(null);
    const [loading, setLoading] = useState(true);
    const [correctEdges, setCorrectEdges] = useEdgesState([]);
    const [testSubmitted, setTestSubmitted] = useState(false);
    const [resultDetails, setResultDetails] = useState({ correctMatches: 0, correctPercentage: 0 });

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
        setCorrectEdges(graph.graphData.edges);
        setTestSubmitted(false); // Reset test state
    };

    const handleCloseClick = () => {
        const confirmQuit = window.confirm('Are you sure you want to quit the test?');
        if (confirmQuit) {
            setSelectedGraph(null);
            setNodes([]);
            setEdges([]);
        }
    };

    const handleBack = () => {
        setSelectedGraph(null);
        setNodes([]);
        setEdges([]);
    };

    const onConnect = useCallback(
        (params) => {
            if (testSubmitted) return;

            setEdges((eds) =>
                addEdge(
                    {
                        ...params,
                        type: 'halfCircle',
                        style: { stroke: '#000000', strokeWidth: 1.5 },
                        markerEnd: { type: 'arrow', color: '#ff0072' },
                    },
                    eds
                )
            );
        },
        [setEdges, testSubmitted]
    );

    const onEdgeClick = useCallback(
        (event, edge) => {
            if (testSubmitted) return;

            event.stopPropagation();
            setEdges((eds) => eds.filter((e) => e.id !== edge.id));
        },
        [setEdges, testSubmitted]
    );

    const testCreation = async () => {
        if (!selectedGraph) return;

        const correctEdgesCount = correctEdges.length;
        let correctMatches = 0;
        const missingCorrectEdges = [];

        const updatedEdges = edges.map((edge) => {
            const isCorrect = correctEdges.some(
                (correctEdge) =>
                    correctEdge.source === edge.source && correctEdge.target === edge.target
            );

            if (isCorrect) {
                correctMatches++;
            }

            return {
                ...edge,
                style: {
                    ...edge.style,
                    stroke: isCorrect ? 'green' : 'red',
                    strokeWidth: 2,
                },
            };
        });

        correctEdges.forEach((correctEdge) => {
            const isAlreadyDrawn = edges.some(
                (edge) => edge.source === correctEdge.source && edge.target === correctEdge.target
            );

            if (!isAlreadyDrawn) {
                missingCorrectEdges.push({
                    ...correctEdge,
                    style: {
                        stroke: 'blue',
                        strokeWidth: 2,
                    },
                });
            }
        });

        const finalEdges = [...updatedEdges, ...missingCorrectEdges];
        setEdges(finalEdges);

        const correctPercentage = (correctMatches / correctEdgesCount) * 100;

        setResultDetails({
            correctMatches,
            correctPercentage,
        });

        setTestSubmitted(true);
    };

    const renderGraph = () => {
        if (!selectedGraph) return null;

        return (
            <div style={{ width: '100%', height: '400px', marginTop: '20px' }}>
                <div
                    style={{
                        textAlign: 'center',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        marginBottom: '10px',
                        border: '1px solid #ccc',
                        color: '#1d4b78',
                        padding: '10px',
                        borderRadius: '15px',
                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    {selectedGraph.name}
                </div>
                {!testSubmitted && (
                    <>
                        <div className="legend">
                            <span className="legend-item">
                                <span className="legend-bullet" style={{ backgroundColor: 'green' }}></span>
                                Source
                            </span>
                            <span className="legend-item">
                                <span className="legend-bullet" style={{ backgroundColor: 'darkred' }}></span>
                                Target
                            </span>
                        </div>
                        <p style={{ textAlign: 'center', margin: '10px 0', color: '#666', fontSize:'15px' }}>
                            Note: You can draw relations from source to target
                        </p>
                    </>
                )}
                {testSubmitted && (
                    <div className="legend">
                        <span className="legend-item">
                            <span className="legend-bullet" style={{ backgroundColor: 'green' }}></span>
                            Correct
                        </span>
                        <span className="legend-item">
                            <span className="legend-bullet" style={{ backgroundColor: 'red' }}></span>
                            Incorrect
                        </span>
                        <span className="legend-item">
                            <span className="legend-bullet" style={{ backgroundColor: 'blue' }}></span>
                            Missed
                        </span>
                    </div>
                )}
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
                <div className="test-buttons">
                    {!testSubmitted ? (
                        <>
                            <button className='submit' onClick={testCreation}>Submit Test</button>
                            <button className='quit' onClick={handleCloseClick}>Quit Test</button>
                        </>
                    ) : (
                        <button className='back' onClick={handleBack}>Back</button>
                    )}
                </div>

                {testSubmitted && (
                    <div className="result-details">
                        <h3>Test Results</h3>
                        <p>Correct Edges: {resultDetails.correctMatches} / {correctEdges.length}</p>

                        <div className="accuracy-bar">
                            <p>Correct Results</p>
                            <div className="progress-wrapper">
                                <LinearProgress
                                    variant="determinate"
                                    value={resultDetails.correctPercentage}
                                    className="progress-bar"
                                />
                                <span
                                    className={`progress-text ${resultDetails.correctPercentage >= 50 ? 'high-accuracy' : ''}`}
                                >
                                    {resultDetails.correctPercentage.toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

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
            ) : selectedGraph ? (
                <div>{renderGraph()}</div>
            ) : (
                graphs.map((graph) => (
                    <div key={graph._id} className="graphs">
                        <button className='taketest' onClick={() => handleViewClick(graph)}>Take Test</button>
                        <div className="graph-info">
                            <span className="graph-name">{graph.name}</span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default Test;
