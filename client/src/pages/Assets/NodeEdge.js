import React from 'react';
import { Handle, Position } from '@xyflow/react';

const CircularNode = ({ data }) => {
  return (
    <div style={{
      width: 80, // Adjust width to make room for content and space
      height: 50, // Adjust height as needed
      borderRadius: '50%', // Circular shape
      backgroundColor: 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#1D4B78',
      position: 'relative', // Position relative for absolute handles
      padding: '0 20px' // Space for the handles
    }}>
      {data.label}
      <Handle
        type="source"
        position={Position.Left}
        style={{ 
          background: 'green',
          width: 8,
          height: 8,
          borderRadius: '50%',
          position: 'absolute', // Absolute positioning to the left
          left: 0, // Align it to the left
          top: '50%', // Vertically center
          transform: 'translateY(-50%)', // Adjust for centering
        }}
      />
      <Handle
        type="target"
        position={Position.Right}
        style={{  
          background: 'darkred',
          width: 8,
          height: 8,
          borderRadius: '50%',
          position: 'absolute', // Absolute positioning to the right
          right: 0, // Align it to the right
          top: '50%', // Vertically center
          transform: 'translateY(-50%)', // Adjust for centering
        }}
      />
    </div>
  );
};


const RectangularNode = ({ data }) => {
  // Function to format the Arabic text to wrap every 4-5 words
  const formatText = (text) => {
    const words = text.split(' ');
    const lines = [];
    for (let i = 0; i < words.length; i += 4) {
      lines.push(words.slice(i, i + 4).join(' '));
    }
    return lines.join('\n');
  };

  return (
    <div style={{
      width: '150px',
      height: 'auto',
      padding: '10px',
      border: '1px solid #1D4B78',
      borderRadius: '5px',
      backgroundColor: '#E8F0FE',
      textAlign: 'center',
      color: '#1D4B78',
      whiteSpace: 'pre-wrap',
      position: 'relative'
    }}>
      {formatText(data.label)}
      <Handle
        type="source"
        position={Position.Top}
        style={{ 
          top: '-15px', 
          left: '60%', 
          background: 'green',
          width: 14, // Diameter of the handle
          height: 14,
          borderRadius: '50%', // Makes it circular
          border: '2px solid #fff', // White border for better visibility
          boxShadow: '0 0 4px rgba(0,0,0,0.5)', // Subtle shadow for a 3D effect
        }}
      />

      {/* Target handle - dark red, larger, with a clear border */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ 
          top: '-15px', 
          left: '40%', 
          background: 'darkred',
          width: 14, // Diameter of the handle
          height: 14,
          borderRadius: '50%', // Makes it circular
          border: '2px solid #fff', // White border for better visibility
          boxShadow: '0 0 4px rgba(0,0,0,0.5)', // Subtle shadow for a 3D effect
        }}
      />
    </div>
  );
};

const HalfCircleEdge = ({ id, sourceX, sourceY, targetX, targetY, style = {}, markerEnd }) => {
  const midX = (sourceX + targetX) / 2;
  const midY = sourceY - 100;

  const edgePath = `M ${sourceX},${sourceY} Q ${midX},${midY} ${targetX},${targetY}`;

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
    </>
  );
};

const ProjectileEdge = ({ id, sourceX, sourceY, targetX, targetY, style = {}, markerEnd }) => {
  // Calculate the horizontal and vertical distances between source and target
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  
  // Calculate the Euclidean distance between source and target
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Dynamically calculate the control point height based on distance
  const heightMultiplier = 0.2; // Adjust this value to control how much height increases with distance
  const controlPointY = Math.min(sourceY, targetY) - (distance * heightMultiplier); // Higher curve for larger distance
  
  // Calculate the X position for the control point, which is the midpoint
  const controlPointX = (sourceX + targetX) / 2;
  
  // Create the quadratic Bézier path for the curved edge
  const edgePath = `M ${sourceX},${sourceY} Q ${controlPointX},${controlPointY} ${targetX},${targetY}`;

  return (
    <>
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="8"
          refY="3.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,7 L10,3.5 z" fill="black" />
        </marker>
      </defs>

      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd="url(#arrowhead)"  // Set arrowhead at the end of the path
      />
    </>
  );
};


export { CircularNode, RectangularNode, HalfCircleEdge, ProjectileEdge };
