export interface Batch {
  id: string;
  courseName: string;
  batchCode: string;
  totalSeats: number;
  seatsRemaining: number;
  courseCoordinator: string;
  status: 'Available' | 'Full';
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookConfig {
  url: string;
  enabled: boolean;
  retryAttempts: number;
  retryDelay: number;
}

export interface NotificationHistory {
  id: string;
  batchId: string;
  batchCode: string;
  status: 'sent' | 'failed' | 'retrying';
  timestamp: Date;
  error?: string;
  retryCount: number;
}