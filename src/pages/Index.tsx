import { BatchCard } from '@/components/BatchCard';
import { BatchForm } from '@/components/BatchForm';
import { WebhookConfig } from '@/components/WebhookConfig';
import { NotificationHistory } from '@/components/NotificationHistory';
import { useBatches } from '@/hooks/useBatches';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

const Index = () => {
  const {
    batches,
    webhookConfig,
    notificationHistory,
    isLoading,
    updateBatch,
    addBatch,
    setWebhookConfig,
    testWebhook,
  } = useBatches();

  const fullBatches = batches.filter(batch => batch.status === 'Full').length;
  const availableBatches = batches.filter(batch => batch.status === 'Available').length;
  const totalSeats = batches.reduce((sum, batch) => sum + batch.totalSeats, 0);
  const occupiedSeats = batches.reduce((sum, batch) => sum + (batch.totalSeats - batch.seatsRemaining), 0);

  const handleUpdateSeats = (id: string, seatsRemaining: number) => {
    updateBatch(id, { seatsRemaining });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Batch Alert Notifier</h1>
                <p className="text-sm text-muted-foreground">Academy Batch Management System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant={webhookConfig.enabled ? 'success' : 'outline'}>
                  {webhookConfig.enabled ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Notifications On
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Notifications Off
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-lg p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Batches</p>
                <p className="text-2xl font-bold">{batches.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Batches</p>
                <p className="text-2xl font-bold text-success">{availableBatches}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Full Batches</p>
                <p className="text-2xl font-bold text-destructive">{fullBatches}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Occupancy</p>
                <p className="text-2xl font-bold">{occupiedSeats}/{totalSeats}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Batch Management */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Batch Management</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BatchForm onAddBatch={addBatch} />
              {batches.map((batch) => (
                <BatchCard
                  key={batch.id}
                  batch={batch}
                  onUpdateSeats={handleUpdateSeats}
                />
              ))}
            </div>
          </div>

          {/* Configuration Panel */}
          <div className="space-y-6">
            <WebhookConfig
              config={webhookConfig}
              onConfigChange={setWebhookConfig}
              onTestWebhook={testWebhook}
            />
            
            <NotificationHistory notifications={notificationHistory} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
