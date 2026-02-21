export interface Notification {
  id: number;
  type: 'alert' | 'info' | 'warning';
  message: string;
  patientId?: number;
  patientName?: string;
  timestamp: string;
  read: boolean;
}
