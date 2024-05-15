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

  // Example dependencies for the new sentence
  const dependencies = [
    [
      { from: 1, to: 0 },
      { from: 2, to: 0 },
      { from: 3, to: 0 },
      { from: 3, to: 4 },
      { from: 4, to: 5 },
      { from: 6, to: 5 }
    ]
  ];

  // Hardcoded nodes for the new sentence
  const nodes = [
    { id: 0, label: 'الكلب .1(Noun)' },
    { id: 1, label: 'البني .2(Adj)' },
    { id: 2, label: 'الصغير .3(Adj)' },
    { id: 3, label: 'يلعب .4(Verb)' },
    { id: 4, label: 'في .5(Prep)' },
    { id: 5, label: 'الحديقة .6(Noun)' },
    { id: 6, label: 'الخضراء .7(Adj)' }
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
      <div className="graph-container" style={{ width: '100%', overflow: 'auto' }}>
        {activeGraph && (
          <>
            <Graph
              graph={activeGraph}
              options={{
                layout: {
                  randomSeed: undefined, // Remove this line
                  hierarchical: false,
                  improvedLayout: false
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
                  },
                  smooth: {
                    type: 'curvedCCW'
                  }
                },
                interaction: {
                  dragNodes: false,
                  dragView: false,
                  zoomView: false, // Disable zooming
                  zoom: false // Disable zooming
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
              style={{ height: '400px' }} // Adjust the height as needed
            />
            <button className="export-button" onClick={exportGraphData}>
              Export Graph Data
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SyntacticAnalysis;
