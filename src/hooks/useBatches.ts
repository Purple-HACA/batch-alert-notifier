import { useState, useEffect, useCallback } from 'react';
import { Batch, NotificationHistory, WebhookConfig } from '@/types/batch';
import { toast } from '@/hooks/use-toast';

// Mock data for demonstration
const mockBatches: Batch[] = [
  {
    id: '1',
    courseName: 'Digital Marketing',
    batchCode: 'DM25',
    totalSeats: 30,
    seatsRemaining: 2,
    courseCoordinator: 'Sarah Johnson',
    status: 'Available',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    courseName: 'Web Development',
    batchCode: 'WD12',
    totalSeats: 25,
    seatsRemaining: 0,
    courseCoordinator: 'Michael Chen',
    status: 'Full',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: '3',
    courseName: 'Data Science',
    batchCode: 'DS08',
    totalSeats: 20,
    seatsRemaining: 5,
    courseCoordinator: 'Dr. Emily Rodriguez',
    status: 'Available',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-19'),
  },
];

export const useBatches = () => {
  const [batches, setBatches] = useState<Batch[]>(mockBatches);
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>({
    url: '',
    enabled: false,
    retryAttempts: 3,
    retryDelay: 1000,
  });
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendWebhookNotification = useCallback(async (batch: Batch): Promise<boolean> => {
    if (!webhookConfig.url || !webhookConfig.enabled) {
      console.log('Webhook not configured or disabled');
      return false;
    }

    const message = `Batch Update Notification:
**Course:** ${batch.courseName}
**Batch Code:** ${batch.batchCode}
**Batch Status:** Full
**Seats Remaining:** 0
**Course Coordinator:** ${batch.courseCoordinator}
The batch is now full.`;

    try {
      const response = await fetch(webhookConfig.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          text: message,
          timestamp: new Date().toISOString(),
          batchData: {
            courseName: batch.courseName,
            batchCode: batch.batchCode,
            status: batch.status,
            seatsRemaining: batch.seatsRemaining,
            courseCoordinator: batch.courseCoordinator,
          },
        }),
      });

      const notification: NotificationHistory = {
        id: Date.now().toString(),
        batchId: batch.id,
        batchCode: batch.batchCode,
        status: 'sent',
        timestamp: new Date(),
        retryCount: 0,
      };

      setNotificationHistory(prev => [notification, ...prev]);
      return true;
    } catch (error) {
      const notification: NotificationHistory = {
        id: Date.now().toString(),
        batchId: batch.id,
        batchCode: batch.batchCode,
        status: 'failed',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: 0,
      };

      setNotificationHistory(prev => [notification, ...prev]);
      console.error('Webhook notification failed:', error);
      return false;
    }
  }, [webhookConfig]);

  const updateBatch = useCallback(async (id: string, updates: Partial<Batch>) => {
    setIsLoading(true);
    try {
      setBatches(prev => prev.map(batch => {
        if (batch.id === id) {
          const updatedBatch = {
            ...batch,
            ...updates,
            status: (updates.seatsRemaining !== undefined && updates.seatsRemaining === 0) ? 'Full' as const : batch.status,
            updatedAt: new Date(),
          };

          // Check if batch just became full and send notification
          if (batch.seatsRemaining > 0 && updatedBatch.seatsRemaining === 0) {
            sendWebhookNotification(updatedBatch);
            toast({
              title: "Batch Full Alert",
              description: `${updatedBatch.batchCode} is now full. Notification sent!`,
              variant: "default",
            });
          }

          return updatedBatch;
        }
        return batch;
      }));
    } finally {
      setIsLoading(false);
    }
  }, [sendWebhookNotification]);

  const addBatch = useCallback((newBatch: Omit<Batch, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const batch: Batch = {
      ...newBatch,
      id: Date.now().toString(),
      status: newBatch.seatsRemaining === 0 ? 'Full' : 'Available',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setBatches(prev => [batch, ...prev]);
    
    toast({
      title: "Batch Added",
      description: `${batch.batchCode} has been created successfully.`,
    });
  }, []);

  const testWebhook = useCallback(async () => {
    if (!webhookConfig.url) {
      toast({
        title: "Error",
        description: "Please configure webhook URL first.",
        variant: "destructive",
      });
      return;
    }

    const testBatch: Batch = {
      id: 'test',
      courseName: 'Test Course',
      batchCode: 'TEST01',
      totalSeats: 10,
      seatsRemaining: 0,
      courseCoordinator: 'Test Coordinator',
      status: 'Full',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const success = await sendWebhookNotification(testBatch);
    
    toast({
      title: success ? "Test Successful" : "Test Failed",
      description: success 
        ? "Test notification sent to Zoho Cliq successfully!"
        : "Failed to send test notification. Check webhook URL and try again.",
      variant: success ? "default" : "destructive",
    });
  }, [webhookConfig.url, sendWebhookNotification]);

  return {
    batches,
    webhookConfig,
    notificationHistory,
    isLoading,
    updateBatch,
    addBatch,
    setWebhookConfig,
    testWebhook,
    sendWebhookNotification,
  };
};