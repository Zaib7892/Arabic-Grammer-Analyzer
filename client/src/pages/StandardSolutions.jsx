import React, { useState, useEffect } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
  } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CircularNode, HalfCircleEdge } from './Assets/NodeEdge';
import '../style/StandardSolutions.css';
import { NavLink } from 'react-router-dom';

const StandardSolutions = () => {
    const [graphs, setGraphs] = useState([]);
    const [selectedGraph, setSelectedGraph] = useState(null);

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
                <NavLink to="/standardsolutions/givefeedback">Give Feedback</NavLink>
            </p>
        </div>
    );

    return (
        <div className="sentences">
            {graphs.map((graph, index) => (
                <div key={index} className="solution" style={{ display: 'inline-block', marginRight: '10px' }}>
                    <span>{graph.name}</span>
                    {!selectedGraph || selectedGraph._id !== graph._id ? (
                        <button onClick={() => handleViewClick(graph)}>View</button>
                    ) : (
                        renderGraph(selectedGraph)
                    )}
                </div>
            ))}
        </div>
    );
};

export default StandardSolutions;
