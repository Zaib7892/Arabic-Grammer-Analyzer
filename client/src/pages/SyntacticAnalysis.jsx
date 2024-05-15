import React, { useState } from 'react';
import Graph from 'react-graph-vis';
import '../style/Diacritization.css';
import '../style/SyntacticAnalysis.css';

const SyntacticAnalysis = () => {
  const arabicTextSentences = [
    "الكلب البني الصغير يلعب في الحديقة الخضراء", // New sentence
  ];

  const translations = [
    "The small brown dog plays in the green garden", // Translation of the new sentence
  ];

  const posTags = [
    [["Det", "Adj", "Adj", "Noun", "Verb", "Prep", "Det", "Adj", "Noun"]] // POS tags for the new sentence
  ];

  // Example dependencies for the new sentence
  const dependencies = [
    [
      { from: 0, to: 1, label: posTags[0][0][0] }, // Adding label for each edge
      { from: 1, to: 2, label: posTags[0][0][1] },
      { from: 2, to: 3, label: posTags[0][0][2] },
      { from: 3, to: 4, label: posTags[0][0][3] },
      { from: 4, to: 5, label: posTags[0][0][4] },
      { from: 5, to: 6, label: posTags[0][0][5] },
      { from: 6, to: 7, label: posTags[0][0][6] },
      { from: 7, to: 8, label: posTags[0][0][7] },
    ]
  ];

  // Hardcoded nodes for the new sentence
  const nodes = [
    { id: 0, label: 'الكلب' },
    { id: 1, label: 'البني' },
    { id: 2, label: 'الصغير' },
    { id: 3, label: 'يلعب' },
    { id: 4, label: 'في' },
    { id: 5, label: 'الحديقة' },
    { id: 6, label: 'الخضراء' }
  ];

  const [selectedSentence, setSelectedSentence] = useState('');
  const [translatedSentence, setTranslatedSentence] = useState('');
  const [activeGraph, setActiveGraph] = useState(null);
  const [selectedNode1, setSelectedNode1] = useState(null);
  const [selectedNode2, setSelectedNode2] = useState(null);

  const selectSentence = (sentence) => {
    setSelectedSentence(sentence);
    setTranslatedSentence('');
    setActiveGraph(null);
  };

  const translateSentence = () => {
    if (selectedSentence !== '') {
      const index = arabicTextSentences.indexOf(selectedSentence);
      if (index !== -1) {
        setTranslatedSentence(translations[index]);
      }
    }
  };

  const analyzeSentence = () => {
    const index = arabicTextSentences.indexOf(selectedSentence);
    if (index !== -1) {
      setActiveGraph({
        nodes: nodes,
        edges: dependencies[index]
      });
    }
  };
  const exportGraphData = () => {
    const graphData = JSON.stringify(activeGraph);
    const element = document.createElement("a");
    const file = new Blob([graphData], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = "graph-data.json";
    document.body.appendChild(element); // Required for Firefox
    element.click();
  };
  const getCurvedEdgePath = (from, to, curvature = 0.5) => {
    const fromX = nodes[from].x;
    const toX = nodes[to].x;
    const fromY = nodes[from].y;
    const toY = nodes[to].y;

    const deltaX = toX - fromX;
    const deltaY = toY - fromY;
    const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const offsetX = (curvature * dist) / 2;

    const data = [
      'M', fromX, fromY,
      'Q', fromX + offsetX, fromY - 50,
      toX, toY,
    ];

    return data.join(' ');
  };

  const getNodePosition = (nodeId) => {
    return { x: 1000 - nodeId * 150, y: 100 };
  };

  nodes.forEach((node, index) => {
    node.x = getNodePosition(index).x;
    node.y = getNodePosition(index).y;
  });


  return (
    <div className="text-analysis">
      <div className="results-container">
        <div className="selected-sentence">
          {selectedSentence}
          <div className="translated-sentence">
            {translatedSentence && <p><strong>Translation:</strong> {translatedSentence}</p>}
          </div>
        </div>
        <div className="sentences-list">
          {arabicTextSentences.map((sentence, index) => (
            <div key={index} onClick={() => selectSentence(sentence)}>
              {index + 1}. {sentence}
            </div>
          ))}
        </div>
      </div>
      <div className="buttons-container">
        <button className="analyze-button" onClick={analyzeSentence}>
          Analyze
        </button>
        <button className="translate-button" onClick={translateSentence}>
          Translate
        </button>
      </div>
      <div className="graph-container">
        {activeGraph && (
          <>
          <Graph
            graph={activeGraph}
            options={{
              layout: {
                hierarchical: false
              },
              edges: {
                color: {
                  color: 'royalblue', // Set color to royal blue
                  highlight: 'royalblue',
                  hover: 'royalblue'
                },
                font: {
                  color: 'black',
                  size: 12
                }
              },
              interaction: {
                dragNodes: false, 
                dragView: false 
              }
            }}
            events={{
              selectNode: ({ nodes }) => {
                if (selectedNode1 === null) {
                  setSelectedNode1(nodes[0]);
                } else {
                  setSelectedNode2(nodes[0]);
                }
              },
              deselectNode: ({ nodes }) => {
                if (selectedNode1 === nodes[0]) {
                  setSelectedNode1(null);
                } else if (selectedNode2 === nodes[0]) {
                  setSelectedNode2(null);
                }
              }
            }}
            getEdgeLabel={(edge) => edge.label} // Display edge label as POS tag
            getEdgeTitle={() => null}
            getCurvedEdgePath={(edge, start, end, _points) => getCurvedEdgePath(start, end)}
            style={{ width: '100%', height: '400px' }}
          />
          <button className="export-button" onClick={exportGraphData}>
              Export Graph Data
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default SyntacticAnalysis;
