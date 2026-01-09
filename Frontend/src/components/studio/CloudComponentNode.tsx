import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Badge } from '@/components/ui/badge';

// AWS Icon Components
const EC2Icon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="6" width="16" height="12" rx="2" stroke="#D93B00" strokeWidth="2" fill="#FF9900" />
    <circle cx="8" cy="10" r="1" fill="#fff" />
    <circle cx="12" cy="10" r="1" fill="#fff" />
    <circle cx="16" cy="10" r="1" fill="#fff" />
  </svg>
);

const S3Icon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6C2 4.89543 2.89543 4 4 4Z" stroke="#565656" strokeWidth="2" fill="#D7D7D7" />
    <path d="M4 8L20 8" stroke="#565656" strokeWidth="2" />
    <path d="M4 12L20 12" stroke="#565656" strokeWidth="2" />
    <path d="M4 16L20 16" stroke="#565656" strokeWidth="2" />
  </svg>
);

const RDSIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="12" cy="6" rx="8" ry="3" stroke="#CC3D5C" strokeWidth="2" fill="#FDA9B6" />
    <rect x="4" y="9" width="16" height="10" rx="2" stroke="#CC3D5C" strokeWidth="2" fill="#FDA9B6" />
    <circle cx="12" cy="14" r="1" fill="#fff" />
  </svg>
);

const LambdaIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 19L12 5L19 19" stroke="#F5832F" strokeWidth="2" fill="#FCAD5A" />
    <path d="M8 15H16" stroke="#F5832F" strokeWidth="2" />
  </svg>
);

const VPCIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="#232F3E" strokeWidth="2" fill="#F18B34" />
    <rect x="6" y="6" width="12" height="12" rx="1" stroke="#232F3E" strokeWidth="1" fill="#FFFFFF" />
  </svg>
);

const CloudComponentNode = ({ id, data, isConnectable }: NodeProps) => {
  const [hovered, setHovered] = useState(false);
  const { label = 'AWS Resource', type = 'ec2', status = 'running', config = {} } = data;

  // Get appropriate icon based on type
  const renderIcon = () => {
    switch (type.toLowerCase()) {
      case 'ec2':
        return <EC2Icon />;
      case 's3':
        return <S3Icon />;
      case 'rds':
        return <RDSIcon />;
      case 'lambda':
      case 'function':
        return <LambdaIcon />;
      case 'vpc':
        return <VPCIcon />;
      default:
        return <EC2Icon />; // Default to EC2 icon
    }
  };

  // Get status color
  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case 'running':
        return 'bg-green-500';
      case 'stopped':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get resource details based on type
  const getResourceDetails = () => {
    switch (type.toLowerCase()) {
      case 'ec2':
        return `Type: ${config.instance_type || 't3.micro'}`;
      case 's3':
        return `Bucket: ${config.bucket || 'N/A'}`;
      case 'rds':
        return `${config.engine || 'postgres'} on ${config.instance_class || 'db.t3.micro'}`;
      case 'lambda':
        return `${config.runtime || 'python3.9'} | ${config.memory_size || 128}MB`;
      default:
        return '';
    }
  };

  return (
    <div 
      className={`bg-white border-2 rounded-lg shadow-md p-3 flex flex-col items-center min-w-[140px] transition-all duration-200 ${
        hovered ? 'shadow-lg scale-105' : 'shadow-sm'
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Status indicator */}
      <div className="flex justify-between w-full mb-2">
        <div className={`w-3 h-3 rounded-full ${getStatusColor()} border border-gray-300`} />
        <Badge variant="secondary" className="text-xs px-2 py-0">
          {type.toUpperCase()}
        </Badge>
      </div>
      
      {/* Icon */}
      <div className="mb-2 flex justify-center">
        {renderIcon()}
      </div>
      
      {/* Label */}
      <div className="text-center text-sm font-medium text-gray-800 truncate w-full">
        {label}
      </div>
      
      {/* Resource details */}
      <div className="text-center text-xs text-gray-500 mt-1 truncate w-full">
        {getResourceDetails()}
      </div>
      
      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-green-500"
      />
    </div>
  );
};

export default memo(CloudComponentNode);