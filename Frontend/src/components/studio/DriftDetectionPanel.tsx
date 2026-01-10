import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  ShieldAlert, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  RotateCcw, 
  Eye, 
  History,
  Cloud,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { projectApi } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DriftDetectionPanelProps {
  projectId?: string;
  className?: string;
}

const DriftDetectionPanel: React.FC<DriftDetectionPanelProps> = ({ projectId, className }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [driftStatus, setDriftStatus] = useState<'idle' | 'checking' | 'drift-found' | 'no-drift' | 'error'>('idle');
  const [driftResults, setDriftResults] = useState<any>(null);
  const [credentials, setCredentials] = useState({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1',
  });
  const [showCredentials, setShowCredentials] = useState(false);

  const handleCheckDrift = async () => {
    if (!projectId) {
      toast.error('Project ID is required');
      return;
    }

    // Validate credentials
    if (!credentials.accessKeyId || !credentials.secretAccessKey) {
      toast.error('AWS credentials are required');
      return;
    }

    setIsChecking(true);
    setDriftStatus('checking');

    try {
      const response = await projectApi.detectDrift(projectId, {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        region: credentials.region,
      });

      if (response.success) {
        setDriftResults(response);
        setDriftStatus(response.hasDrift ? 'drift-found' : 'no-drift');
        toast.success(response.message);
      } else {
        setDriftStatus('error');
        toast.error('Drift detection failed: ' + response.message);
      }
    } catch (error: any) {
      setDriftStatus('error');
      toast.error('Drift detection failed: ' + error.message);
    } finally {
      setIsChecking(false);
    }
  };

  const handleInputChange = (field: keyof typeof credentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStatusIcon = () => {
    switch (driftStatus) {
      case 'drift-found':
        return <ShieldAlert className="w-5 h-5 text-destructive" />;
      case 'no-drift':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'checking':
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      default:
        return <Activity className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (driftStatus) {
      case 'drift-found':
        return 'Drift Detected';
      case 'no-drift':
        return 'No Drift Detected';
      case 'checking':
        return 'Checking for drift...';
      case 'error':
        return 'Error occurred';
      default:
        return 'Ready to check';
    }
  };

  const getStatusVariant = () => {
    switch (driftStatus) {
      case 'drift-found':
        return 'destructive';
      case 'no-drift':
        return 'success';
      case 'checking':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Card className={cn("bg-glass border-glass-border", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-destructive/10 rounded-lg">
              <ShieldAlert className="w-4 h-4 text-destructive" />
            </div>
            <CardTitle className="text-sm font-semibold">Drift Detection</CardTitle>
          </div>
          <Badge variant={driftStatus === 'drift-found' ? 'destructive' : driftStatus === 'no-drift' ? 'success' : 'default'}>
            {getStatusIcon()}
            <span className="ml-1 capitalize">{getStatusText()}</span>
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Monitor unauthorized changes to your infrastructure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>Last checked: {driftResults?.timestamp ? new Date(driftResults.timestamp).toLocaleString() : 'Never'}</span>
            </div>
            <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setShowCredentials(true)}>
                  <ShieldAlert className="w-3 h-3 mr-1" />
                  Check Now
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-destructive" />
                    Drift Detection
                  </DialogTitle>
                </DialogHeader>
                
                <Tabs defaultValue="credentials" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="credentials">Credentials</TabsTrigger>
                    <TabsTrigger value="results" disabled={driftStatus === 'idle' || driftStatus === 'checking'}>Results</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="credentials" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="accessKeyId">Access Key ID</Label>
                        <Input
                          id="accessKeyId"
                          type="password"
                          placeholder="AKIA..."
                          value={credentials.accessKeyId}
                          onChange={(e) => handleInputChange('accessKeyId', e.target.value)}
                          disabled={isChecking}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="secretAccessKey">Secret Access Key</Label>
                        <Input
                          id="secretAccessKey"
                          type="password"
                          placeholder="Your secret key"
                          value={credentials.secretAccessKey}
                          onChange={(e) => handleInputChange('secretAccessKey', e.target.value)}
                          disabled={isChecking}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="region">Region</Label>
                        <Input
                          id="region"
                          placeholder="us-east-1"
                          value={credentials.region}
                          onChange={(e) => handleInputChange('region', e.target.value)}
                          disabled={isChecking}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleCheckDrift} 
                        disabled={isChecking || !credentials.accessKeyId || !credentials.secretAccessKey}
                        className="w-full"
                      >
                        {isChecking ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Checking...
                          </>
                        ) : (
                          <>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Detect Drift
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="results" className="space-y-4">
                    {driftStatus === 'checking' ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                        <p className="text-sm text-muted-foreground">Analyzing infrastructure state...</p>
                      </div>
                    ) : driftStatus === 'drift-found' ? (
                      <div className="space-y-4">
                        <Alert variant="destructive">
                          <AlertTriangle className="w-4 h-4" />
                          <AlertDescription>
                            Drift detected! {driftResults?.driftedResources?.length || 0} resources have been modified outside of the tool.
                          </AlertDescription>
                        </Alert>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Drifted Resources:</h4>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {(driftResults?.driftedResources || []).map((resource: any, index: number) => (
                              <div key={index} className="p-3 bg-destructive/5 border border-destructive/20 rounded-md">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Cloud className="w-4 h-4 text-destructive" />
                                    <span className="font-mono text-sm">{resource.type}.{resource.identifier}</span>
                                  </div>
                                  <Badge variant="destructive">{resource.action}</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : driftStatus === 'no-drift' ? (
                      <div className="space-y-4">
                        <Alert className="bg-green-50 border-green-200">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <AlertDescription className="text-green-700">
                            No drift detected! Your infrastructure matches the expected configuration.
                          </AlertDescription>
                        </Alert>
                        
                        <div className="flex items-center justify-center py-4">
                          <div className="text-center">
                            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                            <p className="text-sm font-medium">Infrastructure is in sync</p>
                            <p className="text-xs text-muted-foreground">No unauthorized changes detected</p>
                          </div>
                        </div>
                      </div>
                    ) : driftStatus === 'error' ? (
                      <div className="space-y-4">
                        <Alert variant="destructive">
                          <AlertTriangle className="w-4 h-4" />
                          <AlertDescription>
                            Error occurred during drift detection. Please check your credentials and try again.
                          </AlertDescription>
                        </Alert>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center py-8 text-center">
                          <div>
                            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-sm font-medium">Ready to scan</p>
                            <p className="text-xs text-muted-foreground">Check for infrastructure drift</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
          
          {driftStatus === 'drift-found' && (
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                {driftResults?.driftedResources?.length || 0} resources have drifted from the expected configuration.
              </AlertDescription>
            </Alert>
          )}
          
          {driftStatus === 'no-drift' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Infrastructure is in sync with expected configuration.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DriftDetectionPanel;