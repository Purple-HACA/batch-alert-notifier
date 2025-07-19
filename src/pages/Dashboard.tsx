import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseBatches } from '@/hooks/useSupabaseBatches';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BatchManagement } from '@/components/BatchManagement';
import { WebhookManagement } from '@/components/WebhookManagement';
import { NotificationHistory } from '@/components/NotificationHistory';
import { UserManagement } from '@/components/UserManagement';
import { 
  BookOpen, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  LogOut,
  Settings,
  Bell,
  BarChart3
} from 'lucide-react';

const Dashboard = () => {
  const { profile, signOut, isAdmin, canManageBatches, canManageWebhooks } = useAuth();
  const { 
    batches, 
    webhookConfigs, 
    notifications, 
    isLoading,
    fetchBatches,
    fetchWebhookConfigs,
    fetchNotifications 
  } = useSupabaseBatches();

  const [activeTab, setActiveTab] = useState('batches');

  const handleRefresh = () => {
    fetchBatches();
    fetchWebhookConfigs();
    fetchNotifications();
  };

  const fullBatches = batches.filter(batch => batch.status === 'full').length;
  const openBatches = batches.filter(batch => batch.status === 'open').length;
  const totalCapacity = batches.reduce((sum, batch) => sum + batch.max_capacity, 0);
  const currentEnrollment = batches.reduce((sum, batch) => sum + batch.current_count, 0);

  const activeWebhooks = webhookConfigs.filter(config => config.is_active).length;

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading user profile...</p>
        </div>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold text-foreground">Batch Alert Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {profile.full_name} • {profile.role.replace('_', ' ')} • {profile.department}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant={activeWebhooks > 0 ? 'success' : 'outline'}>
                  {activeWebhooks > 0 ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {activeWebhooks} Webhooks Active
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      No Webhooks
                    </>
                  )}
                </Badge>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Batches</p>
                  <p className="text-2xl font-bold">{batches.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open Batches</p>
                  <p className="text-2xl font-bold text-success">{openBatches}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Full Batches</p>
                  <p className="text-2xl font-bold text-destructive">{fullBatches}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Enrollment</p>
                  <p className="text-2xl font-bold">{currentEnrollment}/{totalCapacity}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="batches" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Batches
            </TabsTrigger>
            {canManageWebhooks() && (
              <TabsTrigger value="webhooks" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Webhooks
              </TabsTrigger>
            )}
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            {isAdmin() && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="batches">
            <BatchManagement />
          </TabsContent>

          {canManageWebhooks() && (
            <TabsContent value="webhooks">
              <WebhookManagement />
            </TabsContent>
          )}

          <TabsContent value="notifications">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Notification History</h2>
              <div className="grid gap-4">
                {notifications.map((notification) => (
                  <Card key={notification.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm">{notification.message}</p>
                        <Badge variant={notification.status === 'sent' ? 'success' : 'destructive'}>
                          {notification.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {isAdmin() && (
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;