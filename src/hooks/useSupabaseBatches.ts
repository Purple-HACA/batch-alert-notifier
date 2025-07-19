import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

interface Batch {
  id: string;
  name: string;
  description: string | null;
  max_capacity: number;
  current_count: number;
  status: 'open' | 'full' | 'closed' | 'cancelled';
  department: 'marketing' | 'tech' | 'finance' | 'design';
  start_date: string | null;
  end_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface WebhookConfig {
  id: string;
  name: string;
  webhook_url: string;
  department: 'marketing' | 'tech' | 'finance' | 'design';
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface NotificationHistory {
  id: string;
  batch_id: string | null;
  webhook_config_id: string | null;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
}

export const useSupabaseBatches = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [webhookConfigs, setWebhookConfigs] = useState<WebhookConfig[]>([]);
  const [notifications, setNotifications] = useState<NotificationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();

  const fetchBatches = useCallback(async () => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching batches:', error);
        toast({
          title: "Error",
          description: "Failed to fetch batches.",
          variant: "destructive",
        });
        return;
      }

      setBatches(data || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  }, [profile, toast]);

  const fetchWebhookConfigs = useCallback(async () => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase
        .from('webhook_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching webhook configs:', error);
        return;
      }

      setWebhookConfigs(data || []);
    } catch (error) {
      console.error('Error fetching webhook configs:', error);
    }
  }, [profile]);

  const fetchNotifications = useCallback(async () => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      fetchBatches();
      fetchWebhookConfigs();
      fetchNotifications();
    }
  }, [profile, fetchBatches, fetchWebhookConfigs, fetchNotifications]);

  const createBatch = useCallback(async (batchData: {
    name: string;
    description?: string;
    max_capacity: number;
    department: 'marketing' | 'tech' | 'finance' | 'design';
    start_date?: string;
    end_date?: string;
  }) => {
    if (!profile) return false;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('batches')
        .insert([{
          ...batchData,
          created_by: profile.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating batch:', error);
        toast({
          title: "Error",
          description: "Failed to create batch.",
          variant: "destructive",
        });
        return false;
      }

      setBatches(prev => [data, ...prev]);
      toast({
        title: "Batch Created",
        description: `${data.name} has been created successfully.`,
      });
      return true;
    } catch (error) {
      console.error('Error creating batch:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [profile, toast]);

  const updateBatch = useCallback(async (id: string, updates: Partial<Batch>) => {
    if (!profile) return false;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('batches')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating batch:', error);
        toast({
          title: "Error",
          description: "Failed to update batch.",
          variant: "destructive",
        });
        return false;
      }

      setBatches(prev => prev.map(batch => 
        batch.id === id ? data : batch
      ));

      // Check if batch became full and send notification
      if (data.status === 'full' && updates.current_count === data.max_capacity) {
        await sendBatchFullNotification(data);
      }

      return true;
    } catch (error) {
      console.error('Error updating batch:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [profile, toast]);

  const createWebhookConfig = useCallback(async (webhookData: {
    name: string;
    webhook_url: string;
    department: 'marketing' | 'tech' | 'finance' | 'design';
  }) => {
    if (!profile) return false;
    
    try {
      const { data, error } = await supabase
        .from('webhook_configs')
        .insert([{
          ...webhookData,
          created_by: profile.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating webhook config:', error);
        toast({
          title: "Error",
          description: "Failed to create webhook configuration.",
          variant: "destructive",
        });
        return false;
      }

      setWebhookConfigs(prev => [data, ...prev]);
      toast({
        title: "Webhook Created",
        description: "Webhook configuration created successfully.",
      });
      return true;
    } catch (error) {
      console.error('Error creating webhook config:', error);
      return false;
    }
  }, [profile, toast]);

  const sendBatchFullNotification = useCallback(async (batch: Batch) => {
    // Find active webhook for the batch's department
    const webhook = webhookConfigs.find(wh => 
      wh.department === batch.department && wh.is_active
    );

    if (!webhook) {
      console.log('No active webhook found for department:', batch.department);
      return;
    }

    const message = `Batch Full Alert: ${batch.name} in ${batch.department} department is now full (${batch.current_count}/${batch.max_capacity} enrolled).`;

    try {
      // Send webhook notification
      const response = await fetch(webhook.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          text: message,
          timestamp: new Date().toISOString(),
          batchData: {
            name: batch.name,
            status: batch.status,
            capacity: `${batch.current_count}/${batch.max_capacity}`,
            department: batch.department,
          },
        }),
      });

      // Log notification to database
      await supabase
        .from('notifications')
        .insert([{
          batch_id: batch.id,
          webhook_config_id: webhook.id,
          message,
          status: 'sent',
          sent_at: new Date().toISOString()
        }]);

      toast({
        title: "Notification Sent",
        description: `Batch full alert sent for ${batch.name}.`,
      });

    } catch (error) {
      console.error('Error sending notification:', error);
      
      // Log failed notification
      await supabase
        .from('notifications')
        .insert([{
          batch_id: batch.id,
          webhook_config_id: webhook.id,
          message,
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        }]);
    }
  }, [webhookConfigs, toast]);

  const testWebhook = useCallback(async (webhookId: string) => {
    const webhook = webhookConfigs.find(wh => wh.id === webhookId);
    if (!webhook) return false;

    const testMessage = `Test notification from Batch Alert System - ${new Date().toLocaleString()}`;

    try {
      await fetch(webhook.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          text: testMessage,
          timestamp: new Date().toISOString(),
          isTest: true
        }),
      });

      // Log test notification
      await supabase
        .from('notifications')
        .insert([{
          webhook_config_id: webhook.id,
          message: testMessage,
          status: 'sent',
          sent_at: new Date().toISOString()
        }]);

      toast({
        title: "Test Successful",
        description: "Test notification sent successfully.",
      });
      return true;
    } catch (error) {
      console.error('Error testing webhook:', error);
      
      // Log failed test
      await supabase
        .from('notifications')
        .insert([{
          webhook_config_id: webhook.id,
          message: testMessage,
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        }]);

      toast({
        title: "Test Failed",
        description: "Failed to send test notification.",
        variant: "destructive",
      });
      return false;
    }
  }, [webhookConfigs, toast]);

  return {
    batches,
    webhookConfigs,
    notifications,
    isLoading,
    createBatch,
    updateBatch,
    createWebhookConfig,
    testWebhook,
    fetchBatches,
    fetchWebhookConfigs,
    fetchNotifications
  };
};