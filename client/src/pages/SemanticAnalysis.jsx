import React, { useState, useRef } from 'react';
import Graph from 'react-graph-vis';
import '../style/SyntacticAnalysis.css';

const SemanticAnalysis = () => {
    const graphRef = useRef(null); // Reference to the Graph component

    // Arabic sentences and their corresponding POS tags
    const arabicTextSentences = [
        "هذه الجملة الأولى",
        "وهذه الجملة الثانية",
        "ثم تأتي الجملة الثالثة",
    ];

    // Translation of sentences
    const translations = [
        "This is the first sentence",
        "And this is the second sentence",
        "Then comes the third sentence",
    ];

    const posTags = [
        [["Det", "Det", "Noun", "Adj"], ["Conj", "Det", "Noun", "Adj"], ["Adv", "Verb", "Det", "Noun", "Adj"]]
    ];

    const [graphData, setGraphData] = useState(null); // State to hold graph data
    const [selectedSentence, setSelectedSentence] = useState(''); // State to track selected sentence
    const [translatedSentence, setTranslatedSentence] = useState(''); // State to hold translated sentence

    // Function to select a sentence
    const selectSentence = (sentence) => {
        setSelectedSentence(sentence);
        setTranslatedSentence('');
    };

    // Function to translate the selected sentence
    const translateSentence = () => {
        if (selectedSentence !== '') {
            const index = arabicTextSentences.indexOf(selectedSentence);
            if (index !== -1) {
                setTranslatedSentence(translations[index]);
            }
        }
    };

    // Function to generate graph data
    const generateGraphData = () => {
        let nodes = [];
        let edges = [];
        let offsetX = 0;

        // Create nodes for each word in sentences
        arabicTextSentences.forEach((sentence, sentenceIndex) => {
            const words = sentence.split(' ');
            words.forEach((word, wordIndex) => {
                const wordLength = word.length * 10; // Calculate word length
                const x = offsetX - wordLength; // Position node from right to left
                nodes.push({ id: `${sentenceIndex}-${wordIndex}`, label: word, x: x, y: sentenceIndex * 100 });
                offsetX -= wordLength + 20; // Adjust offset for the next word
            });
            offsetX = 0; // Reset offset for the next sentence
        });

        // Connect nodes to represent words in each sentence
        arabicTextSentences.forEach((sentence, sentenceIndex) => {
            const words = sentence.split(' ');
            for (let i = 0; i < words.length - 1; i++) {
                edges.push({ from: `${sentenceIndex}-${i}`, to: `${sentenceIndex}-${i + 1}`, label: posTags[i] }); // Assign each POS tag to the corresponding word
            }
        });
        edges.push({ from: '0-2', to: '1-1' });
        edges.push({ from: '1-2', to: '2-3' }); 
        setGraphData({ nodes, edges });
    };

    // Function to export the graph data as a JSON file
    const exportGraphJSON = () => {
        const graphDataJSON = JSON.stringify(graphData);
        const element = document.createElement("a");
        const file = new Blob([graphDataJSON], { type: 'application/json' });
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
                    {/* Display sentences */}
                    {arabicTextSentences.map((sentence, index) => (
                        <div key={index} onClick={() => selectSentence(sentence)}>
                            {index + 1}. {sentence}
                        </div>
                    ))}
                </div>
            </div>
            <div className="buttons-container">
                <button className="analyze-button" onClick={generateGraphData}>
                    Analyze
                </button>
                <button className="translate-button" onClick={translateSentence}>
                    Translate
                </button>
                {graphData && (
                    <button className="export-button" onClick={exportGraphJSON}>
                        Export JSON
                    </button>
                )}
            </div>
            {/* Display the graph if graphData exists */}
            {graphData && (
                <div className="graph-container" style={{ width: '100%', height: '600px' }}>
                    <Graph
                        ref={graphRef}
                        graph={graphData}
                        options={{
                            layout: {
                                hierarchical: false,
                                layout: 'directed'
                            },
                            edges: {
                                color: {
                                    color: 'royalblue',
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
                                dragView: false,
                                zoomView: false,
                                zoom: false
                            }
                        }}
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>
            )}
        </div>
    );
};

export default SemanticAnalysis;
