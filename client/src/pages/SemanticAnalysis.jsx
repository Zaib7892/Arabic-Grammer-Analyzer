import React, { useState, useCallback, useContext } from 'react';
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
import { RectangularNode, ProjectileEdge } from './Assets/NodeEdge';
import { useSession } from './Contexts/UploadContext';
import { useNavigate } from 'react-router-dom';
import { LoginContext } from '../components/ContextProvider/Context';

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

  const [nodes, setNodes, onNodesChange] = useNodesState(sessionData.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(sessionData.edges || []);

  const handleEdgeClick = useCallback(
    (event, edge) => {
      event.stopPropagation();
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    },
    [setEdges]
  );

  const handleTextChange = (e) => {
    const arabicText = e.target.value;
    if (arabicText.trim()) {
      const isArabic = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s.,؛؟]+$/;
      if (!isArabic.test(arabicText)) {
        setSessionData({
          ...sessionData,
          arabicText: arabicText,
          errorMessage: 'The data is not correct. Please enter Arabic text.',
          isArabic: false,
        });
      } else {
        setSessionData({
          ...sessionData,
          arabicText: arabicText,
          errorMessage: '',
          isArabic: true,
        });
      }
    } else {
      setSessionData({
        ...sessionData,
        arabicText: arabicText,
        errorMessage: '',
        isArabic: false,
      });
    }
  };

  const handleTranslate = async () => {
    if (!sessionData.arabicText.trim()) {
      setSessionData({
        ...sessionData,
        errorMessage: 'Please enter some Arabic text.',
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sessionData.arabicText, to: 'en' }),
      });

      if (response.ok) {
        const data = await response.json();
        setSessionData({
          ...sessionData,
          translatedTextSemantic: data.translatedText,
          errorMessage: '',
        });
      } else {
        setSessionData({
          ...sessionData,
          errorMessage: 'Failed to translate the text. Please try again.',
        });
      }
    } catch (error) {
      setSessionData({
        ...sessionData,
        errorMessage: 'An error occurred while connecting to the translation service.',
      });
    }
  };

  const createGraph = () => {
    if (!sessionData.isArabic) {
      setSessionData({
        ...sessionData,
        errorMessage: 'Please enter valid Arabic text before analyzing.',
      });
      return;
    }

    const sentences = sessionData.arabicText.split(/(?<=[.!؟])\s+/);
    const initialX = 1000;
    const gap = 200;
    const newNodes = [];
    let currentX = initialX;

    sentences.forEach((sentence, index) => {
      const bracketMatch = sentence.match(/\((.*?)\)/);

      if (bracketMatch) {
        const beforeBracket = sentence.split('(')[0].trim();
        const insideBracket = bracketMatch[1].trim();
        const afterBracket = sentence.split(')')[1]?.trim();

        if (beforeBracket) {
          newNodes.push({
            id: `${index}-before`,
            type: 'rectangularNode',
            position: { x: currentX, y: 50 },
            data: { label: beforeBracket },
            draggable: true,
          });
          currentX -= gap;
        }

        newNodes.push({
          id: `${index}-inside`,
          type: 'rectangularNode',
          position: { x: currentX, y: 50 },
          data: { label: insideBracket },
          draggable: true,
        });
        currentX -= gap;

        if (afterBracket) {
          newNodes.push({
            id: `${index}-after`,
            type: 'rectangularNode',
            position: { x: currentX, y: 50 },
            data: { label: afterBracket },
            draggable: true,
          });
          currentX -= gap;
        }
      } else {
        newNodes.push({
          id: `${index}`,
          type: 'rectangularNode',
          position: { x: currentX, y: 50 },
          data: { label: sentence },
          draggable: true,
        });
        currentX -= gap;
      }
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

  const handleConnect = (params) => {
    const newEdges = addEdge({ ...params, type: 'projectileEdge' }, edges);
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
      nodes: nodes,
      edges: edges,
    };

    try {
      const response = await fetch('/savesemGraph', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(graphSemData),
      });

      if (response.ok) {
        alert('Graph uploaded successfully!');
      } else {
        alert('Error uploading graph');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchUserGraphs = () => {
    navigate('/semanticanalysis/previousanalysis');
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
          <button onClick={handleTranslate} className="start-button translate-button">
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
          <button
            onClick={createGraph}
            className="start-button analyze-button"
            disabled={!sessionData.isArabic}
          >
            Analyze
          </button>
          {sessionData.errorMessage && <p className="error-message">{sessionData.errorMessage}</p>}
        </div>
      </div>

      {sessionData.showGraph && (
        <>
          {/* Node Color Legend */}
          <div className="node-legend">
            <div className="legend-item">
               <span className="legend-color target-color"></span> Target
            </div>
            <div className="legend-item">
               <span className="legend-color source-color"></span> Source
            </div>
          </div>
          <p className="legend-note">You can draw relations from source to target if needed</p>

          
          <div style={{ width: '100%', height: '400px', marginTop: '20px' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={handleConnect}
              onEdgeClick={handleEdgeClick}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
            >
              <Controls />
              <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
          </div>
          <div className="button-group">
            <button onClick={fetchUserGraphs} className="start-button view-analysis-button">
              View Analysis
            </button>
            <button onClick={saveGraphToDatabase} className="start-button save-analysis-button">
              Save Analysis
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SemanticAnalysis;
