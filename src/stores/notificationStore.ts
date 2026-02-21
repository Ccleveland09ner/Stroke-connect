import { create } from 'zustand';
import * as notificationsApi from '../api/notifications';
import type { Notification } from '../types/notification';

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  isMutating: boolean;
  mutatingIds: number[];
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  loading: false,
  isMutating: false,
  mutatingIds: [],
  error: null,

  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const res = await notificationsApi.getNotifications();
      if (res.success && res.notifications) {
        set({
          notifications: res.notifications,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch notifications';
      console.error('[notificationStore] fetchNotifications failed:', err);
      set({ error: message, loading: false });
    }
  },

  markAsRead: async (id) => {
    const prevNotifications = get().notifications;

    set({
      notifications: prevNotifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      mutatingIds: [...get().mutatingIds, id],
    });

    try {
      const res = await notificationsApi.markAsRead(id);
      if (res.success) {
        set((s) => ({ mutatingIds: s.mutatingIds.filter((x) => x !== id) }));
      } else {
        set({
          notifications: prevNotifications,
          mutatingIds: [],
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mark notification as read';
      console.error('[notificationStore] markAsRead failed:', err);
      set({
        notifications: prevNotifications,
        error: message,
        mutatingIds: [],
      });
    }
  },

  markAllAsRead: async () => {
    set({ isMutating: true, error: null });
    const prevNotifications = get().notifications;

    set({
      notifications: prevNotifications.map((n) => ({ ...n, read: true })),
    });

    try {
      const res = await notificationsApi.markAllAsRead();
      if (res.success) {
        set({ isMutating: false });
      } else {
        set({ notifications: prevNotifications, isMutating: false });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mark all notifications as read';
      console.error('[notificationStore] markAllAsRead failed:', err);
      set({
        notifications: prevNotifications,
        error: message,
        isMutating: false,
      });
    }
  },

  addNotification: (notificationData) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Math.max(...get().notifications.map((n) => n.id), 0) + 1,
    };
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
    }));
  },
}));

export type { Notification };
