import { apiClient } from './client';
import type { Notification } from '../types/notification';

export async function getNotifications(): Promise<{ success: boolean; notifications: Notification[] }> {
  const { data } = await apiClient.get('/api/notifications');
  return data;
}

export async function markAsRead(id: number) {
  const { data } = await apiClient.put(`/api/notifications/${id}/read`);
  return data;
}

export async function markAllAsRead() {
  const { data } = await apiClient.put('/api/notifications/read-all');
  return data;
}
