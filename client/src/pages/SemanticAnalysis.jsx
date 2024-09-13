import React, { useState, useEffect } from 'react';
import '../style/SemanticAnalysis.css';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { RectangularNode, ProjectileEdge } from './Assets/NodeEdge'; // Import the necessary components

const nodeTypes = {
  rectangularNode: RectangularNode,  // Use the rectangular node type for semantic analysis
};

const edgeTypes = {
  projectileEdge: ProjectileEdge,
};

const SemanticAnalysis = () => {
  const [arabicText, setArabicText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showGraph, setShowGraph] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedEdge, setSelectedEdge] = useState(null);


  const handleEdgeClick = (event, edge) => {
    setSelectedEdge(edge); // Store the selected edge in the state
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Delete' && selectedEdge) {
        // Delete the selected edge
        setEdges((eds) => eds.filter((e) => e.id !== selectedEdge.id));
        setSelectedEdge(null); // Clear the selected edge after deletion
      }
    };

  // Add the event listener when the component mounts
  window.addEventListener('keydown', handleKeyDown);

  // Clean up the event listener when the component unmounts
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}, [selectedEdge]); // Re-run the effect when selectedEdge changes


  const handleTextChange = (e) => {
    setArabicText(e.target.value);
  };

  const handleTranslate = async () => {
    if (!arabicText.trim()) {
      setErrorMessage('Please enter some Arabic text.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: arabicText, to: 'en' }),
      });

      if (response.ok) {
        const data = await response.json();
        setTranslatedText(data.translatedText);
        setErrorMessage('');
      } else {
        setErrorMessage('Failed to translate the text. Please try again.');
      }
    } catch (error) {
      setErrorMessage('An error occurred while connecting to the translation service.');
    }
  };

  const createGraph = () => {
    // Split the Arabic text into sentences
    const sentences = arabicText.split(/(?<=[.!؟])\s+/); // Simple sentence splitting for Arabic

    // Set the initial x position and calculate positions from right to left
    const initialX = 1000; // Adjust this value to set how far right you want to start
    const gap = 200; // Increased value for more spacing between nodes

    const newNodes = sentences.map((sentence, index) => ({
      id: `${index}`,
      type: 'rectangularNode',  // Use the new rectangular node type      // Position nodes from right to left
      position: { x: initialX - index * gap, y: 50 },
      data: { label: sentence },
      draggable: true,
    }));


    setNodes(newNodes);
    setEdges([]); // Reset edges when creating a new graph
    setShowGraph(true);
  };

  const handleConnect = (params) => {
    setEdges((eds) =>
      addEdge({ ...params, type: 'projectileEdge' }, eds) // Ensure type is set to 'projectileEdge'
    );
  };
  

  return (
    <div className="semantic-analysis-container_Top_container">
      <div className="semantic-analysis-container">
        {/* Left side: Translation Box */}
        <div className="translation-box">
          <textarea
            value={translatedText}
            readOnly
            placeholder="Translated text will appear here..."
            className="translation-textarea"
          />
          <button onClick={handleTranslate} className="translate-button">
            Translate
          </button>
        </div>

        {/* Right side: Arabic Input Box */}
        <div className="arabic-input-box">
          <textarea
            value={arabicText}
            onChange={handleTextChange}
            placeholder="Enter Arabic text here..."
            className="arabic-textarea"
          />
          <button onClick={createGraph} className="analyze-button">
            Analyze
          </button>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
      </div>

      {showGraph && (
        <div style={{ width: '100%', height: '400px', marginTop: '20px' }}>
                  <ReactFlow
          nodes={nodes}
          edges={edges.map((edge) => ({
            ...edge,
            style: {
              stroke: selectedEdge && selectedEdge.id === edge.id ? 'red' : '#000', // Change color for selected edge
              strokeWidth: selectedEdge && selectedEdge.id === edge.id ? 3 : 1, // Make the selected edge thicker
            },
          }))}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onEdgeClick={handleEdgeClick} // Attach the edge click handler
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
        >
          <Controls />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>

        </div>
      )}
    </div>
  );
};

export default SemanticAnalysis;
