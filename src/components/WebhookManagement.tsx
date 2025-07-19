import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseBatches } from '@/hooks/useSupabaseBatches';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Send, Globe, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const WebhookManagement = () => {
  const { profile, canManageWebhooks } = useAuth();
  const { webhookConfigs, createWebhookConfig, testWebhook, isLoading } = useSupabaseBatches();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    webhook_url: '',
    department: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.webhook_url || !formData.department) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(formData.webhook_url);
    } catch {
      toast({
        title: "Error",
        description: "Please enter a valid webhook URL.",
        variant: "destructive",
      });
      return;
    }

    const success = await createWebhookConfig({
      name: formData.name,
      webhook_url: formData.webhook_url,
      department: formData.department as 'marketing' | 'tech' | 'finance' | 'design',
    });

    if (success) {
      setFormData({
        name: '',
        webhook_url: '',
        department: '',
      });
      setIsCreateOpen(false);
    }
  };

  const handleTestWebhook = async (webhookId: string) => {
    await testWebhook(webhookId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!canManageWebhooks()) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">You don't have permission to manage webhooks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Webhook Management</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Webhook</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-name">Webhook Name *</Label>
                <Input
                  id="webhook-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Zoho Cliq Notifications"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL *</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  value={formData.webhook_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, webhook_url: e.target.value }))}
                  placeholder="https://cliq.zoho.com/api/v2/channelsbyname/..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook-department">Department *</Label>
                <Select 
                  value={formData.department} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="tech">Tech</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Creating..." : "Add Webhook"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {webhookConfigs.map((webhook) => (
          <Card key={webhook.id} className="transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold">{webhook.name}</CardTitle>
                  <p className="text-sm text-muted-foreground capitalize">{webhook.department}</p>
                </div>
                <Badge variant={webhook.is_active ? 'success' : 'outline'}>
                  {webhook.is_active ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Inactive
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">URL:</span>
                </div>
                <div className="bg-muted p-2 rounded text-xs font-mono break-all">
                  {webhook.webhook_url}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Created:</span>
                <span>{formatDate(webhook.created_at)}</span>
              </div>

              <div className="pt-2 border-t flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTestWebhook(webhook.id)}
                  disabled={!webhook.is_active}
                  className="flex-1"
                >
                  <Send className="h-3 w-3 mr-1" />
                  Test
                </Button>
                
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={webhook.is_active} 
                    disabled={true} // For now, we'll just show the status
                  />
                  <span className="text-xs text-muted-foreground">
                    {webhook.is_active ? 'On' : 'Off'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {webhookConfigs.length === 0 && (
          <div className="col-span-full text-center py-8">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No webhooks configured.</p>
            <p className="text-sm text-muted-foreground mt-2">Add your first webhook to receive batch notifications.</p>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">How to set up Zoho Cliq webhook:</h3>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Go to your Zoho Cliq channel</li>
          <li>Click on the channel settings (gear icon)</li>
          <li>Select "Bots & Integrations" → "Webhooks"</li>
          <li>Create a new webhook and copy the URL</li>
          <li>Paste the URL in the webhook configuration above</li>
        </ol>
      </div>
    </div>
  );
};