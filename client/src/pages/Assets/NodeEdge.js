import React from 'react';
import { Handle, Position } from '@xyflow/react';
const CircularNode = ({ data }) => {
    return (
      <div style={{
        width: 50,
        height: 30,
        borderRadius: '20%',
        backgroundColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#1D4B78',
      }}>
        {data.label}
        <Handle
          type="source"
          position={Position.Left}
          style={{ background: '#555' }}
        />
        <Handle
          type="target"
          position={Position.Right}
          style={{ background: '#555' }}
        />
      </div>
    );
  };
  
  const HalfCircleEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    style = {},
    markerEnd,
  }) => {
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
  export { CircularNode, HalfCircleEdge };