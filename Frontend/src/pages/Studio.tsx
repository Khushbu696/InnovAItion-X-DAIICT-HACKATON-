import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import StudioHeader from '@/components/studio/StudioHeader';
import AWSResourcesBar from '@/components/studio/AWSResourcesBar';
import DiagramCanvas from '@/components/studio/DiagramCanvas';
import TerraformEditor from '@/components/studio/TerraformEditor';
import ToolsPanel from '@/components/studio/ToolsPanel';
import { useStudioStore } from '@/store/useStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useAuthStore } from '@/store/useAuthStore';

const Studio: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { nodes, terraformCode } = useStudioStore();
  const [mongoProjectId, setMongoProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>('Untitled Project');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Auto-save hook
  const { manualSave } = useAutoSave({
    projectId: mongoProjectId,
    projectName,
    nodes,
    generatedCode: terraformCode,
    debounceMs: 2000, // Auto-save after 2 seconds of inactivity
    onSaveSuccess: (savedProjectId: string) => {
      setMongoProjectId(savedProjectId);
      // Update URL if this is a new project
      if (!projectId || projectId !== savedProjectId) {
        navigate(`/studio/${savedProjectId}`, { replace: true });
      }
    },
    onSaveStatusChange: (status) => {
      setSaveStatus(status);
    },
  });

  // Create a wrapper function that matches the expected signature
  const handleManualSave = useCallback(async () => {
    await manualSave();
  }, [manualSave]);

  // Mark as unsaved when nodes or terraform code changes
  React.useEffect(() => {
    if (nodes.length > 0 || terraformCode.length > 0) {
      setSaveStatus('unsaved');
    }
  }, [nodes, terraformCode]);

  // Load project data when projectId changes (if needed)
  React.useEffect(() => {
    // You can add logic here to load existing project data
    // For now, we'll use the projectId from URL as mongoProjectId if it exists
    if (projectId && projectId.startsWith('project-')) {
      // This is a local project ID, not MongoDB ID
      // We'll create a new MongoDB project when first save happens
      setMongoProjectId(null);
    } else if (projectId) {
      // This might be a MongoDB project ID
      setMongoProjectId(projectId);
    }
  }, [projectId]);

  // Expose manual save function to StudioHeader via context or prop
  React.useEffect(() => {
    // Store manual save function in a way StudioHeader can access it
    (window as any).__studioManualSave = handleManualSave;
    return () => {
      delete (window as any).__studioManualSave;
    };
  }, [handleManualSave]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-screen flex flex-col bg-background overflow-hidden"
    >
      <StudioHeader 
        projectId={mongoProjectId || projectId || null}
        projectName={projectName}
        onProjectNameChange={setProjectName}
        onManualSave={handleManualSave}
        saveStatus={saveStatus}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - AI Infrastructure Generator and Drift Detection (Collapsible) */}
        <ToolsPanel projectId={projectId || mongoProjectId || undefined} />
        
        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Horizontal AWS Resources Bar */}
          <AWSResourcesBar />
          
          {/* Diagram Canvas */}
          <div className="flex-1">
            <DiagramCanvas />
          </div>
        </div>
        
        {/* Right Sidebar - Terraform Editor */}
        <TerraformEditor />
      </div>
    </motion.div>
  );
};

export default Studio;