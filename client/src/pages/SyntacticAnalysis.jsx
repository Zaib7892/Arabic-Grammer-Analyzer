import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import '../style/Diacritization.css';
import '../style/SyntacticAnalysis.css';

const CircularNode = ({ data }) => {
  return (
    <div style={{
      width: 80,
      height: 50,
      borderRadius: '20%',
      backgroundColor: 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#1D4B78',
    }}>
      {data.label}
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
      />
    </div>
  );
};

const nodeTypes = {
  circularNode: CircularNode,
};

const SyntacticAnalysis = () => {
  const location = useLocation();
  const { selectedSentence } = location.state || {};
  const [translatedSentence, setTranslatedSentence] = useState('');
  const [analysisResult, setAnalysisResult] = useState([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    setNodes([]);
    setEdges([]);
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
      } else {
        setAnalysisResult([{ error: 'Error analyzing text' }]);
      }
    } catch (error) {
      setAnalysisResult([{ error: 'Error communicating with API' }]);
    }
  };

  const createGraph = (data) => {
    const width = 1000; // Adjust the total width based on your layout needs

    const newNodes = data.map((token, index) => ({
      id: `${index}`,
      type: 'circularNode',
      position: { x: width - index * 100, y: 0 },
      data: { label: `${token.text} (${token.pos})` },  //tagging
    }));

    const newEdges = data.map((token, index) => {
      const headIndex = data.findIndex(t => t.text === token.head);
      return {
        id: `e${index}`,
        source: `${headIndex}`,
        target: `${index}`,
        style: { stroke: '#000000', strokeWidth: 1 },
      };
    }).filter(edge => edge.source !== edge.target); // Filter self-loops

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const onConnect = useCallback((params) =>
    setEdges((eds) => addEdge({ ...params, style: { stroke: '#000000', strokeWidth: 1 } }, eds)), [setEdges]
  );

  const onEdgeClick = useCallback((event, edge) => {
    event.stopPropagation(); // Prevents triggering other click events
    setEdges((eds) => eds.filter((e) => e.id !== edge.id)); // Removes the clicked edge
  }, [setEdges]);

  return (
    <div className="text-analysis">
      <div className="results-container">
        <div className="selected-sentence">
          {selectedSentence && <p> {selectedSentence}</p>}
        </div>
        <div className="translated-sentence">
          {translatedSentence && <p> {translatedSentence}</p>}
        </div>
      </div>
      <div className="buttons-container">
        <button className="translate-button" onClick={translateSentence}>
          Translate
        </button>
        <button className="analyze-button" onClick={analyzeSentence}>
          Analyze
        </button>
      </div>
      <div style={{ width: '100%', height: '400px', marginTop: '20px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect} // Enables dynamic edge creation with arrowheads
          onEdgeClick={onEdgeClick} // Enables edge deletion on click
          nodeTypes={nodeTypes}
        >
          <Controls />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default SyntacticAnalysis;
