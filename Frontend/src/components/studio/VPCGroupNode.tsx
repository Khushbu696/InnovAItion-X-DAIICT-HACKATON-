import React, { memo } from 'react';
import { Handle, Position, NodeProps, useReactFlow, useStoreApi } from 'reactflow';
import { useStudioStore } from '@/store/useStore';

const VPCGroupNode = ({ id, data, isConnectable }: NodeProps) => {
  const { getNodes } = useReactFlow();
  const { updateNodeParent } = useStudioStore();
  const store = useStoreApi();

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    
    const reactFlowBounds = (event.target as Element).closest('.react-flow')?.getBoundingClientRect();
    
    if (!reactFlowBounds) return;

    const { nodeInternals } = store.getState();
    const draggingNode = Array.from(nodeInternals.values()).find(n => n.dragging);

    if (draggingNode && draggingNode.id !== id) {
      // Update the dropped node to have this VPC as parent using the store function
      updateNodeParent(draggingNode.id, id);
    }
  };

  return (
    <div
      className="bg-blue-50 bg-opacity-30 border-2 border-dashed border-blue-400 rounded-lg shadow-sm min-w-[400px] min-h-[300px] relative overflow-visible"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        width: data.width || 400,
        height: data.height || 300,
      }}
    >
      {/* Top label */}
      <div className="absolute -top-6 left-4 bg-blue-500 text-white px-3 py-1 rounded-md text-sm font-semibold z-10">
        VPC
      </div>
      
      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500"
      />
      
      {/* Content area */}
      <div className="p-4 h-full">
        <div className="text-center text-gray-500 text-sm mt-20">
          Drag resources here to place them in this VPC
        </div>
      </div>
    </div>
  );
};

export default memo(VPCGroupNode);