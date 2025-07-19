import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { WebhookConfig as WebhookConfigType } from '@/types/batch';
import { Settings, TestTube, Save } from 'lucide-react';

interface WebhookConfigProps {
  config: WebhookConfigType;
  onConfigChange: (config: WebhookConfigType) => void;
  onTestWebhook: () => void;
}

export const WebhookConfig = ({ config, onConfigChange, onTestWebhook }: WebhookConfigProps) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onConfigChange(localConfig);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalConfig(config);
    setIsEditing(false);
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Webhook Configuration
          </CardTitle>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Zoho Cliq Webhook URL</Label>
              <Input
                id="webhookUrl"
                value={localConfig.url}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://cliq.zoho.com/api/v2/channelsbyname/..."
                type="url"
              />
              <p className="text-xs text-muted-foreground">
                Enter your Zoho Cliq channel webhook URL
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="webhook-enabled">Enable Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically send notifications when batches become full
                </p>
              </div>
              <Switch
                id="webhook-enabled"
                checked={localConfig.enabled}
                onCheckedChange={(enabled) => setLocalConfig(prev => ({ ...prev, enabled }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="retryAttempts">Retry Attempts</Label>
                <Input
                  id="retryAttempts"
                  type="number"
                  min="1"
                  max="10"
                  value={localConfig.retryAttempts}
                  onChange={(e) => setLocalConfig(prev => ({ 
                    ...prev, 
                    retryAttempts: parseInt(e.target.value) || 1 
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="retryDelay">Retry Delay (ms)</Label>
                <Input
                  id="retryDelay"
                  type="number"
                  min="100"
                  max="10000"
                  step="100"
                  value={localConfig.retryDelay}
                  onChange={(e) => setLocalConfig(prev => ({ 
                    ...prev, 
                    retryDelay: parseInt(e.target.value) || 1000 
                  }))}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel} className="flex-1">
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Webhook URL:</p>
                <p className="text-xs text-muted-foreground break-all font-mono">
                  {config.url || 'Not configured'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 border rounded-md">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">
                    {config.enabled ? (
                      <span className="text-success">Enabled</span>
                    ) : (
                      <span className="text-muted-foreground">Disabled</span>
                    )}
                  </p>
                </div>

                <div className="text-center p-3 border rounded-md">
                  <p className="text-sm text-muted-foreground">Retry Attempts</p>
                  <p className="font-medium">{config.retryAttempts}</p>
                </div>
              </div>
            </div>

            <Button 
              onClick={onTestWebhook} 
              variant="outline" 
              className="w-full"
              disabled={!config.url}
            >
              <TestTube className="h-4 w-4 mr-2" />
              Test Webhook
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};