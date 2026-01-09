import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { Maximize2 } from 'lucide-react';
import { useStudioStore } from '@/store/useStore';
import AWSNode from './AWSNode';
import VPCGroupNode from './VPCGroupNode';
import CloudComponentNode from './CloudComponentNode';
import CustomEdge from './CustomEdge';
import { AWSResource } from '@/store/useStore';

const nodeTypes = {
  awsNode: AWSNode,
  vpcGroup: VPCGroupNode,
  cloudComponent: CloudComponentNode,
};

let id = 0;
const getId = () => `node_${id++}`;

const DiagramCanvas: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = React.useState<ReactFlowInstance | null>(null);
  
  const { nodes, edges, setNodes, setEdges, addNode, setSelectedNode } = useStudioStore();
  
  const [localNodes, setLocalNodes, onNodesChange] = useNodesState(nodes);
  const [localEdges, setLocalEdges, onEdgesChange] = useEdgesState(edges);
  
  React.useEffect(() => {
    setNodes(localNodes);
  }, [localNodes, setNodes]);
  
  React.useEffect(() => {
    setEdges(localEdges);
  }, [localEdges, setEdges]);
  
  const onConnect = useCallback(
    (params: Connection) => {
      // Determine connection type based on node types
      const sourceNode = localNodes.find(node => node.id === params.source);
      const targetNode = localNodes.find(node => node.id === params.target);
      
      let connectionType = 'private'; // default
      
      if (sourceNode && targetNode) {
        // If connecting to or from a database node
        if (sourceNode.data.resourceType === 'rds' || targetNode.data.resourceType === 'rds') {
          connectionType = 'database';
        } 
        // If connecting to internet gateway or similar public resource
        else if (sourceNode.data.resourceType === 'gateway' || targetNode.data.resourceType === 'gateway') {
          connectionType = 'public';
        }
      }
      
      setLocalEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'default',
            data: { connectionType },
            animated: true,
            style: { strokeWidth: 2 },
          },
          eds
        )
      );
    },
    [setLocalEdges, localNodes]
  );
  
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      
      const data = event.dataTransfer.getData('application/reactflow');
      if (!data || !reactFlowInstance || !reactFlowWrapper.current) return;
      
      const resource: AWSResource = JSON.parse(data);
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });
      
      // Determine node type based on resource
      let nodeType = 'cloudComponent'; // Default to new cloud component
      if (resource.type === 'vpc' || resource.name.toLowerCase().includes('vpc')) {
        nodeType = 'vpcGroup';
      }
      
      const newNode: Node = {
        id: getId(),
        type: nodeType,
        position,
        data: {
          label: resource.name,
          resourceType: resource.type,
          icon: resource.icon,
          terraformType: resource.terraformType,
          category: resource.category,
          type: resource.type,
        },
      };
      
      setLocalNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, setLocalNodes]
  );
  
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );
  
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);
  
  const fitView = () => {
    reactFlowInstance?.fitView({ padding: 0.2 });
  };
  
  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full relative">
      <ReactFlow
        nodes={localNodes}
        edges={localEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[24, 24]}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: 'hsl(190, 95%, 55%)', strokeWidth: 2 },
        }}
        edgeTypes={{
          default: CustomEdge,
        }}
        className="bg-background"
      >
        <Background 
          gap={24} 
          size={1} 
          color="hsla(220, 15%, 20%, 0.5)"
        />
        <Controls 
          className="!bg-glass !border-glass-border !rounded-xl"
          showInteractive={false}
        />
        <MiniMap
          className="!bg-glass !border-glass-border !rounded-xl"
          nodeColor="hsl(190, 95%, 55%)"
          maskColor="hsla(220, 20%, 6%, 0.8)"
        />
      </ReactFlow>
      
      {/* Fit View Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={fitView}
        className="absolute top-4 right-4 p-3 bg-glass border border-glass-border rounded-xl text-muted-foreground hover:text-foreground hover:bg-glass-highlight transition-all shadow-glass"
      >
        <Maximize2 className="w-4 h-4" />
      </motion.button>
      
      {/* Empty State */}
      {localNodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-glass border border-glass-border flex items-center justify-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary opacity-50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Start Building</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Drag AWS resources from the sidebar to design your infrastructure
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const DiagramCanvasWrapper: React.FC = () => (
  <ReactFlowProvider>
    <DiagramCanvas />
  </ReactFlowProvider>
);

export default DiagramCanvasWrapper;
