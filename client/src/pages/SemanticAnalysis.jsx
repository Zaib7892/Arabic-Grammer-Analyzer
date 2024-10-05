import React, { useState, useEffect, useContext } from 'react';
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
import { useSession } from './Contexts/UploadContext'; // Import the session context
import {useNavigate } from 'react-router-dom';
import { LoginContext } from '../components/ContextProvider/Context';

const nodeTypes = {
  rectangularNode: RectangularNode,
};

const edgeTypes = {
  projectileEdge: ProjectileEdge,
};


const SemanticAnalysis = () => {
  const navigate = useNavigate();
  const { sessionData, setSessionData } = useSession(); // Use session data
  const [selectedEdge, setSelectedEdge] = useState(null);
  const {logindata,setLoginData} = useContext(LoginContext);

  // Update states from sessionData
  const [nodes, setNodes, onNodesChange] = useNodesState(sessionData.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(sessionData.edges || []);

  //login context for user id
 

  const handleEdgeClick = (event, edge) => {
    setSelectedEdge(edge);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Delete' && selectedEdge) {
        setEdges((eds) => eds.filter((e) => e.id !== selectedEdge.id));
        setSelectedEdge(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedEdge]);

  const handleTextChange = (e) => {
    setSessionData({
      ...sessionData,
      arabicText: e.target.value,
    });
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
    setEdges([]); // Reset edges when creating a new graph

    // Update sessionData for nodes, edges, and graph visibility
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

    // Update edges in session data
    setSessionData({
      ...sessionData,
      edges: newEdges,
    });
  };
// for data storing to database
const saveGraphToDatabase = async () => {
  const graphSemData = {
    userId:logindata.ValidUserOne._id, //Ensure this is part of your session data
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
      alert('Graph uploaded successfully!'); // Graph saved successfully!
    } else {
      alert('Error uploading graph');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
// fetching anlaysis for loggedIn user
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
            placeholder="Translated text will appear here..."
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
            placeholder="Enter Arabic text here..."
            className="arabic-textarea"
          />
          <button onClick={createGraph} className="start-button analyze-button">
            Analyze
          </button>
          {sessionData.errorMessage && <p className="error-message">{sessionData.errorMessage}</p>}
        </div>
        <button onClick={fetchUserGraphs}>See Previous Analysis</button>
      </div>

      {sessionData.showGraph && (
        <div style={{ width: '100%', height: '400px', marginTop: '20px' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
          >
            <Controls />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
          <button onClick={saveGraphToDatabase}>Save Analysis</button>
        </div>
      )}
    </div>
  );
};

export default SemanticAnalysis;
