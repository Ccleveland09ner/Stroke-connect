export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  date: string;
  time: string;
  type: 'initial' | 'follow-up' | 'emergency';
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  scheduledBy?: {
    id: number;
    name: string;
    role: string;
  };
}
