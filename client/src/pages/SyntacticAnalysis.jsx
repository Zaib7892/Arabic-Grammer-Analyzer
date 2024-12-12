import React, { useState, useEffect, useCallback, useContext } from "react";
import { useLocation } from "react-router-dom";
import { LoginContext } from "../components/ContextProvider/Context";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import "../style/SyntacticAnalysis.css";
import { CircularNode, HalfCircleEdge } from "./Assets/NodeEdge";
import { diacritizeArabicText } from "../diaApi"; // Import the diacritization API

const nodeTypes = {
  circularNode: CircularNode,
};

const edgeTypes = {
  halfCircle: HalfCircleEdge,
};

const removeDiacritics = (text) => {
  // Unicode range for Arabic diacritics
  const diacriticsRegex = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;
  return text.replace(diacriticsRegex, "");
};

const SyntacticAnalysis = () => {
  const [selectedParser, setSelectedParser] = useState("spacy"); // Default to 'spacy'
  const location = useLocation();
  const { selectedSentence: initialSentence } = location.state || {};
  const [selectedSentence, setSelectedSentence] = useState(
    initialSentence || ""
  );
  const [translatedSentence, setTranslatedSentence] = useState("");
  const [analysisResult, setAnalysisResult] = useState([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showGraph, setShowGraph] = useState(false);
  const [loading, setLoading] = useState(false); // State for loading
  const { logindata, setLoginData } = useContext(LoginContext);
  const [tooltip, setTooltip] = useState({
    visible: false,
    content: "",
    position: { x: 0, y: 0 },
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".react-flow__node")) {
        setTooltip({ ...tooltip, visible: false });
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [tooltip]);

  useEffect(() => {
    if (selectedSentence) {
      setNodes([]);
      setEdges([]);
      setShowGraph(false); // Hide the graph and download button initially
    }
  }, [selectedSentence]);

  const translateSentence = async () => {
    try {
      const response = await fetch("http://localhost:8000/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: selectedSentence, to: "en" }),
      });

      if (response.ok) {
        const data = await response.json();
        setTranslatedSentence(data.translatedText);
      } else {
        setTranslatedSentence("Error translating text");
      }
    } catch (error) {
      setTranslatedSentence("Error communicating with API");
    }
  };

  const analyzeSentence = async () => {
    try {
      // Remove diacritics from the selected sentence
      const sentenceWithoutDiacritics = removeDiacritics(selectedSentence);

      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sentenceWithoutDiacritics,
          parser: selectedParser,
        }), // Send selected parser
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysisResult(data);
        createGraph(data);
        setShowGraph(true);
      } else {
        setAnalysisResult([{ error: "Error analyzing text" }]);
      }
    } catch (error) {
      setAnalysisResult([{ error: "Error communicating with API" }]);
    }
  };

  const createGraph = (data) => {
    const width = 1000;

    const newNodes = data.map((token, index) => {
      let morphInfo = {};
      let additionalInfo = "";

      // Build morphological information only if the selected parser is 'camel'
      if (selectedParser === "camel") {
        const morphFeatures = token.morphological_features.split("|");
        morphFeatures.forEach((feature) => {
          const [key, value] = feature.split("=");
          morphInfo[key] = value;
        });

        // Construct additional information for the tooltip
        additionalInfo = `
          POS: ${token.pos}
          Dependency: ${token.dep}
          Gender: ${morphInfo.gen === "m" ? "Masculine" : "Feminine"}
          Number: ${morphInfo.num === "s" ? "Singular" : "Plural"}
          State: ${morphInfo.stt === "d" ? "Definite" : "Indefinite"}
          Case: ${
            morphInfo.cas === "n"
              ? "Nominative"
              : morphInfo.cas === "a"
              ? "Accusative"
              : "Genitive"
          }
          Person: ${morphInfo.per === "na" ? "Not Applicable" : morphInfo.per}
          Rationality: ${morphInfo.rat === "i" ? "Inanimate" : "Animate"}
        `.trim();
        console.log("Tooltip Content:", additionalInfo);
      }

      // Return a node object
      return {
        id: `${index}`,
        type: "circularNode",
        position: { x: width - index * 100, y: 50 },
        data: {
          label: `${token.text}\n${token.pos}`, // For circular node
          tooltipContent:
            additionalInfo || "No additional information available", // Separate property for the tooltip
          onClick: (event) => {
            event.stopPropagation();

            // Get the bounding rectangle of the clicked node
            const boundingBox = event.target.getBoundingClientRect();

            // Add offsets to position the tooltip slightly below the node
            const offsetX = 0; // Keep the tooltip horizontally aligned with the node
            const offsetY = 10; // Adjust vertical offset for spacing below the node

            setTooltip({
              visible: true,
              content: additionalInfo || "No additional information available",
              position: {
                x: boundingBox.left + window.scrollX + offsetX,
                y: boundingBox.bottom + window.scrollY + offsetY,
              },
            });
          },
        },
        draggable: false,
      };
    });

    // Create edges
    const newEdges = data
      .map((token, index) => {
        const headIndex = data.findIndex((t) => t.text === token.head);
        return {
          id: `e${index}`,
          source: `${headIndex}`,
          target: `${index}`,
          type: "halfCircle",
          style: { stroke: "#000000", strokeWidth: 1.5 },
          markerEnd: {
            type: "arrow",
            color: "#ff0072",
          },
        };
      })
      .filter((edge) => edge.source !== edge.target);

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const addDiacritics = async () => {
    if (selectedSentence) {
      try {
        setLoading(true);
        const data = await diacritizeArabicText(selectedSentence);
        setSelectedSentence(data.text);
        setLoading(false);
      } catch (error) {
        console.error("Error adding diacritics", error);
        setLoading(false);
        setSelectedSentence("Error adding diacritics");
      }
    }
  };

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "halfCircle",
            style: { stroke: "#000000", strokeWidth: 1.5 },
            markerEnd: { type: "arrow", color: "#ff0072" },
          },
          eds
        )
      ),
    [setEdges]
  );

  const onEdgeClick = useCallback(
    (event, edge) => {
      event.stopPropagation();
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    },
    [setEdges]
  );

  const downloadGraph = () => {
    const graphData = {
      nodes,
      edges,
    };
    const blob = new Blob([JSON.stringify(graphData, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "graph.json";
    link.click();
  };

  const uploadGraph = async () => {
    try {
      const graphData = {
        userId: logindata.ValidUserOne._id,
        name: selectedSentence,
        graphData: { nodes, edges },
      };

      const response = await fetch("/storegraph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(graphData),
      });

      if (response.ok) {
        alert("Graph uploaded successfully!");
      } else {
        alert("Error uploading graph");
      }
    } catch (error) {
      console.error("Error uploading graph:", error);
      alert("Error communicating with the server");
    }
  };

  return (
    <div className="text-analysis">
      <div className="results-container">
        <div className="selected-sentence">
          <textarea
            value={selectedSentence || ""}
            onChange={(e) => setSelectedSentence(e.target.value)} // Update state on change
            rows={3}
            style={{
              width: "103%",
              border: "none",
              borderRadius: "15px",
              padding: "8px",

              marginTop: "-1.7%",
              marginBottom: "-2%",
              marginRight: "-1.5%",
            }}
          />
        </div>

        <div className="translated-sentence">
          {translatedSentence && <p>{translatedSentence}</p>}
        </div>
      </div>
      <div className="button-container">
        <button className="trans-button" onClick={translateSentence}>
          Translate
        </button>

        <button
          className="diacritics-button"
          onClick={addDiacritics}
          disabled={loading}
        >
          {loading ? "Adding Diacritics..." : "Add Diacritics"}
        </button>

        <button className="analyz-button" onClick={analyzeSentence}>
          Analyze
        </button>
      </div>

      {/* Parser Selection Dropdown */}
      <select value={selectedParser} onChange={(e) => setSelectedParser(e.target.value)}>
        <option value="spacy">Spacy</option>
        <option value="camel">Camel Parser</option>
      </select>

      {showGraph && (
        <>
          {/* Node Color Legend */}
          <div className="node-legend">
            <div className="legend-item">
              <span className="legend-bullet source-color"></span> Source
            </div>
            <div className="legend-item">
              <span className="legend-bullet target-color"></span> Target
            </div>
          </div>
          <p className="note-text">
            Note: You can draw relations from source to target if needed
          </p>

          {/* Tooltip */}
          {tooltip.visible && (
            <div
              className="tooltip"
              style={{
                position: "absolute",
                left: `${tooltip.position.x}px`,
                top: `${tooltip.position.y}px`,
                backgroundColor: "white",
                padding: "5px",
                border: "1px solid black",
                zIndex: 1000,
              }}
            >
              {tooltip.content}
            </div>
          )}

          {/* ReactFlow Graph */}
          <div style={{ width: "100%", height: "400px", marginTop: "20px" }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onEdgeClick={onEdgeClick}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onNodeClick={(event, node) => {
                setTooltip({
                  visible: true,
                  content: `${node.data.tooltipContent}`, // Customize content
                  position: { x: event.clientX, y: event.clientY },
                });
              }}
            >
              <Controls />
              <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
          </div>

          {/* Graph Buttons */}
          <div className="buttonscontainer">
            <button className="download-button-for-user" onClick={downloadGraph}>
              Download Graph
            </button>

            {logindata.ValidUserOne?.type === "a" && (
            <button className="export-button" onClick={downloadGraph}>
              Download Graph
            </button>
            )}

            {logindata.ValidUserOne?.type === "a" && (
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
