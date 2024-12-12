import React, { useState, useCallback, useContext } from "react";
import "../style/SemanticAnalysis.css";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { RectangularNode, ProjectileEdge } from "./Assets/NodeEdge";
import { useSession } from "./Contexts/UploadContext";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../components/ContextProvider/Context";
import { diacritizeArabicText } from "../diaApi"; // Import the diacritization

const nodeTypes = {
  rectangularNode: RectangularNode,
};

const edgeTypes = {
  projectileEdge: ProjectileEdge,
};

const SemanticAnalysis = () => {
  const navigate = useNavigate();
  const { sessionData, setSessionData } = useSession();
  const [selectedEdge, setSelectedEdge] = useState(null);
  const { logindata } = useContext(LoginContext);

  const [nodes, setNodes, onNodesChange] = useNodesState(
    sessionData.nodes || []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    sessionData.edges || []
  );

  const handleEdgeClick = useCallback(
    (event, edge) => {
      event.stopPropagation();
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    },
    [setEdges]
  );

  const handleTextChange = (e) => {
    const arabicText = e.target.value;

    const isArabic =
      /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s.,؛؟()_]+$/;

    if (arabicText.trim()) {
      if (!isArabic.test(arabicText)) {
        setSessionData({
          ...sessionData,
          arabicText,
          errorMessage: "The data is not correct. Please enter Arabic text.",
          isArabic: false,
        });
      } else {
        setSessionData({
          ...sessionData,
          arabicText,
          errorMessage: "",
          isArabic: true,
        });
      }
    } else {
      setSessionData({
        ...sessionData,
        arabicText,
        errorMessage: "",
        isArabic: false,
      });
    }
  };

  const handleTranslate = async () => {
    if (!sessionData.arabicText.trim()) {
      setSessionData({
        ...sessionData,
        errorMessage: "Please enter some Arabic text.",
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sessionData.arabicText, to: "en" }),
      });

      if (response.ok) {
        const data = await response.json();
        setSessionData({
          ...sessionData,
          translatedTextSemantic: data.translatedText,
          errorMessage: "",
        });
      } else {
        setSessionData({
          ...sessionData,
          errorMessage: "Failed to translate the text. Please try again.",
        });
      }
    } catch (error) {
      setSessionData({
        ...sessionData,
        errorMessage:
          "An error occurred while connecting to the translation service.",
      });
    }
  };

  const createGraph = () => {
    if (!sessionData.isArabic) {
      setSessionData({
        ...sessionData,
        errorMessage: "Please enter valid Arabic text before analyzing.",
      });
      return;
    }

    const sentences = sessionData.arabicText
      .split(/(?<=[.!؟])\s+/)
      .map((sentence) => sentence.replace(/[.!؟]+$/, "").trim());

    const initialX = 1000;
    const gap = 200;
    const newNodes = [];
    let currentX = initialX;

    sentences.forEach((sentence, index) => {
      newNodes.push({
        id: `${index}`,
        type: "rectangularNode",
        position: { x: currentX, y: 50 },
        data: { label: sentence },
        draggable: true,
      });
      currentX -= gap;
    });

    setNodes(newNodes);
    setEdges([]);

    setSessionData({
      ...sessionData,
      nodes: newNodes,
      edges: [],
      showGraph: true,
    });
  };

  const addDiacritics = async () => {
    if (!sessionData.arabicText.trim()) {
      setSessionData({
        ...sessionData,
        errorMessage: "Please enter some Arabic text to add diacritics.",
      });
      return;
    }

    try {
      const diacritizedText = await diacritizeArabicText(
        sessionData.arabicText
      ); // Assuming `diacritizeArabicText` is the imported function
      setSessionData({
        ...sessionData,
        arabicText: diacritizedText.text,
        errorMessage: "",
      });
    } catch (error) {
      console.error("Error adding diacritics:", error);
      setSessionData({
        ...sessionData,
        isLoading: false,
        errorMessage: "An error occurred while adding diacritics.",
      });
    }
  };

  const handleConnect = (params) => {
    const newEdges = addEdge({ ...params, type: "projectileEdge", style:{strokeWidth: '2.4' },markerEnd: { type: "arrow", color: "#ff0072",strokeWidth: '1.4' } }, edges);
    setEdges(newEdges);

    setSessionData({
      ...sessionData,
      edges: newEdges,
    });
  };

  const saveGraphToDatabase = async () => {
    const graphSemData = {
      userId: logindata.ValidUserOne._id,
      arabicText: sessionData.arabicText,
      nodes,
      edges,
    };

    try {
      const response = await fetch("/savesemGraph", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(graphSemData),
      });

      if (response.ok) {
        alert("Graph saved successfully!");
      } else {
        alert("Error uploading graph");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchUserGraphs = () => {
    navigate("/semanticanalysis/previousanalysis");
  };

  return (
    <div className="semantic-analysis-container_Top_container">
      <div className="semantic-analysis-container">
        <div className="translation-box">
          <textarea
            value={sessionData.translatedTextSemantic}
            readOnly
            placeholder="Translated text here..."
            className="translation-textarea"
          />
          <button
            onClick={handleTranslate}
            className="start-button translate-button"
          >
            Translate
          </button>
        </div>

        <div className="arabic-input-box">
          <textarea
            value={sessionData.arabicText}
            onChange={handleTextChange}
            placeholder="اپنا متن یہاں لکھیں...."
            className="arabic-textarea"
          />

          <div className="input-box-buttons">
            <button
              onClick={createGraph}
              className="start-button _analyze-button"
              disabled={!sessionData.isArabic}
            >
              Analyze
            </button>

            <button
              onClick={addDiacritics}
              className="start-button _diacritics-button"
            >
              Add Diacritics
            </button>
          </div>

          {sessionData.errorMessage && (
            <p className="error-message">{sessionData.errorMessage}</p>
          )}
        </div>
      </div>

      {sessionData.showGraph && (
        <>
          <div style={{ width: "100%", height: "400px", marginTop: "20px" }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={handleConnect}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onEdgeClick={handleEdgeClick}
            >
              <Controls />
              <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
          </div>
          <div className="button-group">
            <button
              onClick={fetchUserGraphs}
              className="start-button view-analysis-button"
            >
              View Analysis
            </button>
            <button
              onClick={saveGraphToDatabase}
              className="start-button save-analysis-button"
            >
              Save Analysis
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SemanticAnalysis;
