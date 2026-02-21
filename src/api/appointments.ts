import { apiClient } from './client';
import type { Appointment } from '../types/appointment';

export async function getAppointments(): Promise<{ success: boolean; appointments: Appointment[] }> {
  const { data } = await apiClient.get('/api/appointments');
  return data;
}

export async function addAppointment(payload: {
  patientId: number;
  date: string;
  time: string;
  type: string;
  notes?: string;
  status?: string;
}) {
  const { data } = await apiClient.post('/api/appointments', payload);
  return data;
}

export async function updateAppointment(id: number, payload: Partial<Appointment>) {
  const { data } = await apiClient.put(`/api/appointments/${id}`, payload);
  return data;
}
