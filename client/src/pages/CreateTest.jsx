import React, { useState } from 'react';
import Graph from 'react-graph-vis';
import '../style/StandardSolutions.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateTest = () => {
  const arabicTextSentences = [
    "استراتيجيات تحسين الأداء",
    "تطوير البنية التحتية",
    "تعزيز التعاون الفريقي",
    "دمج التقنيات الجديدة",
    "تحليل البيانات المتقدم",
    "ابتكار في الإدارة"
  ];

  const posTags = [
    ["Noun", "Verb", "Noun"],
    ["Noun", "Verb", "Definite Article"],
    ["Verb", "Noun", "Adjective"],
    ["Verb", "Noun", "Adjective"],
    ["Noun", "Noun", "Adjective"],
    ["Noun", "Preposition", "Noun"]
  ];

  const [selectedSentence, setSelectedSentence] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Beginner"); // Set default category to "Beginner"

  const handleViewClick = (index) => {
    setSelectedSentence(index);
  };

  const handleCloseClick = () => {
    setSelectedSentence(null);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const testCreation = () => {
    toast.success(`Test Created Successfully (${selectedCategory} category)`, {
      position: "top-center"
    });
  };

  const renderGraph = (index) => {
    const words = arabicTextSentences[index].split(' ');
    const nodes = words.map((word, wordIndex) => ({
      id: `${index}-${wordIndex}`,
      label: `${word} (${posTags[index][wordIndex]})`,
      x: (words.length - 1 - wordIndex) * 150, // Adjust node position horizontally
      y: 0 // Keep nodes in a single line vertically
    }));
    const edges = words.slice(1).map((word, wordIndex) => ({
      from: `${index}-${wordIndex}`,
      to: `${index}-${wordIndex + 1}`,
      label: null
    }));

    const graphData = { nodes, edges };

    const graphOptions = {
      layout: {
        hierarchical: false
      },
      edges: {
        color: "#000000",
        smooth: {
          type: 'curvedCCW'
        }
      },
      physics: {
        enabled: false
      },
      interaction: {
        dragNodes: false,
        dragView: false,
        zoomView: false,
        selectable: false,
        hover: true
      }
    };

    return (
      <div style={{ overflowX: 'scroll', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'inline-block', marginRight: '10px', minWidth: '400px' }}>
          <button onClick={handleCloseClick}>Close</button>
          <Graph graph={graphData} options={graphOptions} style={{ height: "400px" }} />
          <div className="creat-test">
            <select className='category' value={selectedCategory} onChange={handleCategoryChange} style={{ marginRight: '20px' }}>
              <option value="Beginner">Beginner</option>
              <option value="Medium">Intermediate</option>
              <option value="Expert">Expert</option>
            </select>
            <button className='create-test-button' onClick={testCreation}>Create Test</button>
          </div>
        </div>

        <ToastContainer />
      </div>
    );
  };

  return (
    <div className="sentences">
      {arabicTextSentences.map((sentence, index) => (
        <div key={index} className="solution" style={{ display: 'inline-block', marginRight: '10px' }}>
          <span>{sentence}</span>
          <button onClick={() => handleViewClick(index)}>View</button>
          {selectedSentence === index && (
            <div>
              {renderGraph(index)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default CreateTest;
