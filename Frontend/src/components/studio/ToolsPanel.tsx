import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeftClose, PanelLeft, Wand2, ShieldAlert } from 'lucide-react';
import { useStudioStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
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
      <div className="flex items-center justify-between px-3 h-12 border-b border-sidebar-border bg-sidebar/50">
        {!isToolsPanelCollapsed && (
          <div className="flex items-center gap-2 ml-1">
            <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
            <span className="font-bold text-[11px] uppercase tracking-widest text-foreground/70">Studio Assistant</span>
          </div>
        )}
        
        <button
          onClick={toggleToolsPanel}
          className={cn(
            "p-1.5 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent rounded-md transition-all",
            isToolsPanelCollapsed && "mx-auto"
          )}
        >
          {isToolsPanelCollapsed ? (
            <PanelLeft className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
      
      {/* Content */}
      <AnimatePresence>
        {!isToolsPanelCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Top section - Drift Detection */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              <DriftDetectionPanel projectId={projectId} />
            </div>

            {/* Bottom section - AI Generator */}
            <div className="p-4 border-t border-sidebar-border bg-sidebar/50 backdrop-blur-sm">
              <TextToCloud />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Collapsed State */}
      {isToolsPanelCollapsed && (
        <div className="flex-1 flex flex-col items-center py-6 space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div className="p-2 bg-destructive/5 rounded-full">
              <ShieldAlert className="w-5 h-5 text-destructive/60" />
            </div>
          </div>
          <div className="flex flex-col items-center justify-end flex-1 pb-8">
            <div className="p-2 bg-primary/5 rounded-full">
              <Wand2 className="w-5 h-5 text-primary/60" />
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  );
};

export default ToolsPanel;
