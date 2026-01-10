import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeftClose, PanelLeft, Wand2, ShieldAlert } from 'lucide-react';
import { useStudioStore } from '@/store/useStore';
import TextToCloud from './TextToCloud';
import DriftDetectionPanel from './DriftDetectionPanel';

interface ToolsPanelProps {
  projectId?: string;
}

const ToolsPanel: React.FC<ToolsPanelProps> = ({ projectId }) => {
  const { isToolsPanelCollapsed, toggleToolsPanel } = useStudioStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isToolsPanelCollapsed ? 56 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-full bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <button
          onClick={toggleToolsPanel}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent rounded-lg transition-all"
        >
          {isToolsPanelCollapsed ? (
            <PanelLeft className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
        
        {!isToolsPanelCollapsed && (
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Tools</span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <AnimatePresence>
        {!isToolsPanelCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            <TextToCloud />
            <DriftDetectionPanel projectId={projectId} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Collapsed State */}
      {isToolsPanelCollapsed && (
        <div className="flex-1 flex flex-col items-center pt-4 space-y-6">
          <div className="flex flex-col items-center">
            <Wand2 className="w-5 h-5 text-muted-foreground mb-2" />
            <span className="text-xs text-muted-foreground writing-mode-vertical rotate-180" style={{ writingMode: 'vertical-rl' }}>
              AI Generator
            </span>
          </div>
          <div className="flex flex-col items-center">
            <ShieldAlert className="w-5 h-5 text-muted-foreground mb-2" />
            <span className="text-xs text-muted-foreground writing-mode-vertical rotate-180" style={{ writingMode: 'vertical-rl' }}>
              Drift Detection
            </span>
          </div>
        </div>
      )}
    </motion.aside>
  );
};

export default ToolsPanel;
