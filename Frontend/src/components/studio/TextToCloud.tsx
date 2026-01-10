import React, { useState } from 'react';
import { useStudioStore } from '@/store/useStore';
import { convertTextToCloud } from '@/lib/textToCloudService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Sparkles, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

interface TextToCloudProps {
  className?: string;
}

const TextToCloud: React.FC<TextToCloudProps> = ({ className }) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { setNodes, setTerraformCode } = useStudioStore();

  const handleConvert = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter a description of your infrastructure');
      return;
    }

    setIsProcessing(true);
    
    try {
      const result = await convertTextToCloud(inputText);
      
      if (result.success && result.nodes.length > 0) {
        // Get current nodes and add the new ones
        const currentNodes = useStudioStore.getState().nodes;
        const updatedNodes = [...currentNodes, ...result.nodes];
        
        // Update both nodes and terraform code
        setNodes(updatedNodes);
        setTerraformCode(result.terraformCode);
        
        toast.success(`Successfully created ${result.nodes.length} infrastructure components!`);
      } else {
        toast.error(result.message || 'Failed to generate infrastructure from your description');
      }
    } catch (error) {
      console.error('Error converting text to cloud:', error);
      toast.error('An error occurred while generating infrastructure');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleConvert();
    }
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-primary/10 rounded-md">
          <Wand2 className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/80">
          AI Infrastructure Generator
        </h3>
      </div>
      
      <div className="space-y-3">
        <div className="relative">
          <Input
            id="infrastructure-description"
            placeholder="Describe infrastructure..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-background/50 border-sidebar-border focus-visible:ring-primary/20 pr-10 h-10 text-sm"
            disabled={isProcessing}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-muted-foreground/50" />
            )}
          </div>
        </div>
        
        <Button 
          onClick={handleConvert} 
          disabled={isProcessing || !inputText.trim()}
          className="w-full h-10 text-xs font-semibold bg-primary hover:bg-primary/90 transition-all shadow-md group"
        >
          {isProcessing ? (
            <>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <span>Generate Environment</span>
              <Wand2 className="w-3.5 h-3.5 ml-2 group-hover:rotate-12 transition-transform" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default TextToCloud;