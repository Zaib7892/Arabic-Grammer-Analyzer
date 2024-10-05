import React, {useState,useEffect,useContext} from 'react'
import { LoginContext } from '../components/ContextProvider/Context';
import {
    ReactFlow,
    Background,
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
    const {logindata,setLoginData} = useContext(LoginContext);
    const [sem_graphs, setSemGraphs] = useState([]);
    const [selectedsemGraph, setSelectedSemGraph] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect (() =>{
        const fetchUserGraphs = async () => {
            try {
                const response = await fetch(`/getUserGraphs?userId=${logindata.ValidUserOne._id}`, {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json',}
                ,});
                    
            if (response.ok) {
                const data = await response.json();
                setSemGraphs(data);
            } else {
            console.log('Failed to fetch graphs');
          }
        } catch (error) {
          console.error('Error fetching graphs:', error);
        }
        finally {
            setLoading(false); // Set loading to false after data is fetched
        }
      };

      fetchUserGraphs();
    },[]);

    const handleViewClick = (graph) => {
        setSelectedSemGraph(graph);
    };

    const handleCloseClick = () => {
        setSelectedSemGraph(null);
    };

    const renderGraph = (graph) => (
        <div style={{ width: '100%', height: '200px', marginTop: '20px' }}>
            <button onClick={handleCloseClick}>Close</button>
            <ReactFlow
                nodes={graph.nodes}
                edges={graph.edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
            >
                <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
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
                sem_graphs.map((graph, index) => (
                    <div key={index} className="solution" style={{ display: 'inline-block', marginRight: '10px' }}>
                        {/* Display graph name and date with a class for styling */}
                        <span className="date-display">{`${graph.arabicText} (${new Date(graph.createdAt).toLocaleDateString()})`}</span>
                        {!selectedsemGraph || selectedsemGraph._id !== graph._id ? (
                            <button onClick={() => handleViewClick(graph)}>View</button>
                        ) : (
                            renderGraph(selectedsemGraph)
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

export default SemanticSolutions
