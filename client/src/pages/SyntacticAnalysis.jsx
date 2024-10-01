import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { LoginContext } from '../components/ContextProvider/Context';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
/*import '../style/Diacritization.css';*/
import '../style/SyntacticAnalysis.css';
import { CircularNode, HalfCircleEdge } from './Assets/NodeEdge';

const nodeTypes = {
  circularNode: CircularNode,
};

const edgeTypes = {
  halfCircle: HalfCircleEdge,
};

const SyntacticAnalysis = () => {
  const location = useLocation();
  const { selectedSentence } = location.state || {};
  const [translatedSentence, setTranslatedSentence] = useState('');
  const [analysisResult, setAnalysisResult] = useState([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showGraph, setShowGraph] = useState(false);
  const {logindata,setLoginData} = useContext(LoginContext);


  useEffect(() => {
    if (selectedSentence) {
      setNodes([]);
      setEdges([]);
      setShowGraph(false); // Hide the graph and download button initially
    }
  }, [selectedSentence]);

  const translateSentence = async () => {
    try {
      const response = await fetch('http://localhost:8000/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedSentence, to: 'en' }),
      });

      if (response.ok) {
        const data = await response.json();
        setTranslatedSentence(data.translatedText);
      } else {
        setTranslatedSentence('Error translating text');
      }
    } catch (error) {
      setTranslatedSentence('Error communicating with API');
    }
  };

  const analyzeSentence = async () => {
    try {
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedSentence }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysisResult(data);
        createGraph(data);
        setShowGraph(true); // Show the graph and download button
      } else {
        setAnalysisResult([{ error: 'Error analyzing text' }]);
      }
    } catch (error) {
      setAnalysisResult([{ error: 'Error communicating with API' }]);
    }
  };

  const createGraph = (data) => {
    const width = 1000;

    const newNodes = data.map((token, index) => ({
      id: `${index}`,
      type: 'circularNode',
      position: { x: width - index * 100, y: 50 },
      data: { label: `${token.text} (${token.pos})` },
      draggable: false
    }));

    const newEdges = data.map((token, index) => {
      const headIndex = data.findIndex(t => t.text === token.head);
      return {
        id: `e${index}`,
        source: `${headIndex}`,
        target: `${index}`,
        type: 'halfCircle',
        style: { stroke: '#000000', strokeWidth: 1.5 },
        markerEnd: {
          type: 'arrow',
          color: '#ff0072',
        },
      };
    }).filter(edge => edge.source !== edge.target);

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const onConnect = useCallback((params) =>
    setEdges((eds) => addEdge({ ...params, type: 'halfCircle', style: { stroke: '#000000', strokeWidth: 1.5 }, markerEnd: { type: 'arrow', color: '#ff0072' } }, eds)), [setEdges]
  );

  const onEdgeClick = useCallback((event, edge) => {
    event.stopPropagation();
    setEdges((eds) => eds.filter((e) => e.id !== edge.id));
  }, [setEdges]);

  const downloadGraph = () => {
    const graphData = {
      nodes,
      edges
    };
    const blob = new Blob([JSON.stringify(graphData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'graph.json';
    link.click();
  };
  const uploadGraph = async () =>{
    try {
      const graphData = {
        userId: logindata.ValidUserOne._id, // Get user ID from login context
        name: selectedSentence, // Use the selected sentence as the graph name
        graphData: {
          nodes,
          edges
        }
      };

      const response = await fetch('/storegraph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(graphData),
      });

      if (response.ok) {
        alert('Graph uploaded successfully!');
      } else {
        alert('Error uploading graph');
      }
    } 
    catch (error) {
      console.error('Error uploading graph:', error);
      alert('Error communicating with the server');
    }
  };

  return (
    <div className="text-analysis">
      <div className="results-container">
        <div className="selected-sentence">
          {selectedSentence && <p>{selectedSentence}</p>}
        </div>
        <div className="translated-sentence">
          {translatedSentence && <p>{translatedSentence}</p>}
        </div>
      </div>
      <div className="buttons-container">
        <button className="trans-button" onClick={translateSentence}>
          Translate
        </button>
        <button className="analyz-button" onClick={analyzeSentence}>
          Analyze
        </button>
      </div>
      {showGraph && (
        <>
          <div style={{ width: '100%', height: '400px', marginTop: '20px' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onEdgeClick={onEdgeClick}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
            >
              <Controls />
              <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
          </div>
          <div className="buttons-container" style={{ marginTop: '10px' }}>
          <button className="export-button" onClick={downloadGraph}>
            Download Graph
          </button>
          { logindata.ValidUserOne?.type === 'a' && (
          <button className="upload-button" onClick={uploadGraph}>
            Upload Solution
          </button>
          )}
        </div>
        
        </>
      )}
    </div>
  );
};

export default SyntacticAnalysis;
