import { apiClient } from './client';
import type { Patient } from '../types/patient';

export async function getPatients(): Promise<{ success: boolean; patients: Patient[] }> {
  const { data } = await apiClient.get('/api/patients');
  return data;
}

export async function getPatient(id: number): Promise<{ success: boolean; patient: Patient }> {
  const { data } = await apiClient.get(`/api/patients/${id}`);
  return data;
}

export async function getMyRecord(userName: string): Promise<{ success: boolean; patient: Patient }> {
  const { data } = await apiClient.get('/api/patients/me', {
    headers: { 'X-User-Name': userName },
  });
  return data;
}

export async function addPatient(payload: Partial<Patient> & { name: string; age: number; gender: string; medicalRecordNumber: string }) {
  const { data } = await apiClient.post('/api/patients', payload);
  return data;
}

export async function updatePatient(id: number, payload: Partial<Patient>) {
  const { data } = await apiClient.put(`/api/patients/${id}`, payload);
  return data;
}
