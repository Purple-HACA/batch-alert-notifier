import { NotificationHistory as NotificationHistoryType } from '@/types/batch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, CheckCircle, XCircle, Clock } from 'lucide-react';

interface NotificationHistoryProps {
  notifications: NotificationHistoryType[];
}

export const NotificationHistory = ({ notifications }: NotificationHistoryProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'retrying':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="success">Sent</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'retrying':
        return <Badge variant="warning">Retrying</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification History
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No notifications sent yet</p>
            <p className="text-xs">Notifications will appear here when batches become full</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start gap-3 p-3 border rounded-md bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="mt-0.5">
                    {getStatusIcon(notification.status)}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        Batch {notification.batchCode}
                      </span>
                      {getStatusBadge(notification.status)}
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      {notification.timestamp.toLocaleString()}
                    </p>
                    
                    {notification.error && (
                      <p className="text-xs text-destructive">
                        Error: {notification.error}
                      </p>
                    )}
                    
                    {notification.retryCount > 0 && (
                      <p className="text-xs text-warning">
                        Retry attempt: {notification.retryCount}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};