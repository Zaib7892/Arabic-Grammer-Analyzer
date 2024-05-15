import React, { useState } from 'react';
import Graph from 'react-graph-vis';
import '../style/StandardSolutions.css';
import { NavLink } from 'react-router-dom';
const StandardSolutions = () => {
    const arabicTextSentences = [
        "استراتيجيات تحسين الأداء",
        "تطوير البنية التحتية",
        "تعزيز التعاون الفريقي",
        "دمج التقنيات الجديدة",
        "تحليل البيانات المتقدم",
        "ابتكار في الإدارة"
    ];

    const posTags = [
        ["Noun", "Number", "Noun", "Verb", "Noun"],
        ["Noun", "Number", "Noun", "Noun", "Noun"],
        ["Noun", "Number", "Noun", "Noun", "Noun", "Adjective"],
        ["Noun", "Noun", "Noun", "Noun", "Adjective", "Noun"],
        ["Noun", "Noun", "Noun", "Noun", "Adjective", "Noun"],
        ["Noun", "Preposition", "Noun", "Noun", "Preposition", "Noun"]
    ];

    const [selectedSentence, setSelectedSentence] = useState(null);
    const handleViewClick = (index) => {
        setSelectedSentence(index);
    };

    const handleCloseClick = () => {
        setSelectedSentence(null);
    };


    const renderGraph = (index) => {
        const words = arabicTextSentences[index].split(' ');
        const nodes = words.map((word, wordIndex) => ({
            id: `${index}-${wordIndex}`,
            label: word,
            x: (words.length - 1 - wordIndex) * 150, // Adjust node position horizontally
            y: 0 // Keep nodes in a single line vertically
        }));
        const edges = words.slice(1).map((word, wordIndex) => ({
            from: `${index}-${wordIndex}`,
            to: `${index}-${wordIndex + 1}`,
            label: posTags[index][wordIndex]
        }));

        const graphData = { nodes, edges };

        const graphOptions = {
            layout: {
                hierarchical: false
            },
            edges: {
                color: "#000000"
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
                    <p>Is there any problem in analysis? <NavLink to="/standardsolutions/givefeedback">Give Feedback</NavLink> </p> {/* Feedback button */}
                </div>
            </div>
        );
    };

    return (
        <div className="sentences">
            {arabicTextSentences.map((sentence, index) => (
                <div key={index} className="solution" style={{ display: 'inline-block', marginRight: '10px' }}>
                    <span>{sentence}</span>
                    <button onClick={() => handleViewClick(index)}>View</button>
                    {selectedSentence === index && renderGraph(index)}
                </div>
            ))}
        </div>
    );
}

export default StandardSolutions;
