import { create } from 'zustand';

export interface Notification {
  id: number;
  type: 'alert' | 'info' | 'warning';
  message: string;
  patientId?: number;
  patientName?: string;
  timestamp: string;
  read: boolean;
}

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
}

// Mock data for demonstration
const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'alert',
    message: 'Critical: John Doe has NIHSS score of 14, tPA evaluation needed',
    patientId: 1,
    patientName: 'John Doe',
    timestamp: new Date().toISOString(),
    read: false
  },
  {
    id: 2,
    type: 'warning',
    message: 'Jane Smith lab results indicate elevated troponin',
    patientId: 2,
    patientName: 'Jane Smith',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: false
  },
  {
    id: 3,
    type: 'info',
    message: 'Robert Johnson appointment scheduled for tomorrow',
    patientId: 3,
    patientName: 'Robert Johnson',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: true
  }
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  loading: false,
  error: null,
  
  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ notifications: mockNotifications, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch notifications', 
        loading: false 
      });
    }
  },
  
  markAsRead: async (id) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const updatedNotifications = get().notifications.map(notification => {
        if (notification.id === id) {
          return { ...notification, read: true };
        }
        return notification;
      });
      
      set({ notifications: updatedNotifications });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to mark notification as read'
      });
    }
  },
  
  markAllAsRead: async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const updatedNotifications = get().notifications.map(notification => ({
        ...notification,
        read: true
      }));
      
      set({ notifications: updatedNotifications });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to mark all notifications as read'
      });
    }
  },
  
  addNotification: (notificationData) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Math.max(...get().notifications.map(n => n.id), 0) + 1,
    };
    
    set(state => ({ 
      notifications: [newNotification, ...state.notifications]
    }));
  }
}));