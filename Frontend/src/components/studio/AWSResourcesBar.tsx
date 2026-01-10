import React from 'react';
import { motion } from 'framer-motion';
import { Network, Server, HardDrive, Database, Shield, Workflow, Layers, Globe, ArrowLeftRight, Scale, Zap, Container, Boxes, Folder, Files, Table, Cpu, Key, Lock, MessageSquare, Bell, Webhook } from 'lucide-react';
import { awsResources } from '@/data/awsResources';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Network, Server, HardDrive, Database, Shield, Workflow, Layers, Globe, ArrowLeftRight, Scale, Zap, Container, Boxes, Folder, Files, Table, Cpu, Key, Lock, MessageSquare, Bell, Webhook
};

const AWSResourcesBar: React.FC = () => {
  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
  };
  
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, resource: typeof awsResources[0]) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(resource));
    event.dataTransfer.effectAllowed = 'move';
  };
  
  return (
    <div className="h-20 bg-sidebar border-b border-sidebar-border overflow-x-auto overflow-y-hidden">
      <div className="flex items-center h-full px-4 gap-2 min-w-max">
        <div className="flex items-center gap-2 pr-4 border-r border-sidebar-border">
          <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">AWS Resources</span>
        </div>
        <div className="flex items-center gap-2">
          {awsResources.map((resource) => (
            <motion.div
              key={resource.id}
              draggable
              onDragStart={(e) => onDragStart(e, resource)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-grab active:cursor-grabbing bg-transparent hover:bg-sidebar-accent/50 border border-transparent hover:border-glass-border transition-all group min-w-[120px]"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-glass border border-glass-border flex items-center justify-center group-hover:border-primary/30 group-hover:shadow-glow transition-all flex-shrink-0">
                {getIcon(resource.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{resource.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{resource.type}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AWSResourcesBar;
