import React, { useState, useRef } from 'react';
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
import { CircularNode, HalfCircleEdge } from './Assets/NodeEdge';

const nodeTypes = {
  circularNode: CircularNode,
};

const edgeTypes = {
  halfCircle: HalfCircleEdge,
};


const SemanticAnalysis = () => {
    const [arabicText, setArabicText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [analysisResult, setAnalysisResult] = useState([]); // Add this line to define analysisResult state
    const [errorMessage, setErrorMessage] = useState('');
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [showGraph, setShowGraph] = useState(false);

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
    
    
    
    // Handle changes in the Arabic text input
    const handleTextChange = (e) => {
      setArabicText(e.target.value);
    };
  
    // Handle the translation request
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
  
      const analyzeSentence = async () => {
    try {
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: arabicText }),
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
            <button onClick={analyzeSentence} className="analyze-button">
              Analyze
            </button>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>
  </div>
        {showGraph && (
                <>
                  <div style={{ width: '100%', height: '400px', marginTop: '20px' }}>
                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      onNodesChange={onNodesChange}
                      onEdgesChange={onEdgesChange}
                      nodeTypes={nodeTypes}
                      edgeTypes={edgeTypes}
                    >
                      <Controls />
                      <Background variant="dots" gap={12} size={1} />
                    </ReactFlow>
                  </div>
                
                </>
              )}
      </div>
    );
  };
  
  export default SemanticAnalysis;

