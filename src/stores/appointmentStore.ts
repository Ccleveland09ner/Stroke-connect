import { create } from 'zustand';
import { format, addDays } from 'date-fns';
import { useAuthStore } from './authStore';

export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  date: string;
  time: string;
  type: 'initial' | 'follow-up' | 'emergency';
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  scheduledBy: {
    id: number;
    name: string;
    role: string;
  };
}

interface AppointmentState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  fetchAppointments: () => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<boolean>;
  updateAppointment: (id: number, data: Partial<Appointment>) => Promise<boolean>;
  cancelAppointment: (id: number) => Promise<boolean>;
  canScheduleAppointment: (userId: number, userRole: string, patientId: number) => boolean;
}

// Mock data for demonstration
const today = new Date();
const mockAppointments: Appointment[] = [
  {
    id: 1,
    patientId: 1,
    patientName: 'John Doe',
    date: format(today, 'yyyy-MM-dd'),
    time: '09:00',
    type: 'emergency',
    notes: 'Stroke evaluation',
    status: 'scheduled',
    scheduledBy: {
      id: 2,
      name: 'Alex Rodriguez',
      role: 'technician'
    }
  },
  {
    id: 2,
    patientId: 2,
    patientName: 'Jane Smith',
    date: format(addDays(today, 1), 'yyyy-MM-dd'),
    time: '14:30',
    type: 'follow-up',
    notes: 'Stroke recovery follow-up',
    status: 'scheduled',
    scheduledBy: {
      id: 1,
      name: 'Dr. Sarah Johnson',
      role: 'neurologist'
    }
  },
  {
    id: 3,
    patientId: 3,
    patientName: 'Robert Johnson',
    date: format(addDays(today, 2), 'yyyy-MM-dd'),
    time: '11:15',
    type: 'follow-up',
    notes: 'Post-tPA follow-up',
    status: 'scheduled',
    scheduledBy: {
      id: 3,
      name: 'Jamie Smith',
      role: 'patient'
    }
  }
];

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  loading: false,
  error: null,
  
  fetchAppointments: async () => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ appointments: mockAppointments, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch appointments', 
        loading: false 
      });
    }
  },
  
  addAppointment: async (appointmentData) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newAppointment: Appointment = {
        ...appointmentData,
        id: Math.max(...get().appointments.map(a => a.id), 0) + 1,
      };
      
      set(state => ({ 
        appointments: [...state.appointments, newAppointment],
        loading: false 
      }));
      
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add appointment', 
        loading: false 
      });
      return false;
    }
  },
  
  updateAppointment: async (id, data) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedAppointments = get().appointments.map(appointment => {
        if (appointment.id === id) {
          return { ...appointment, ...data };
        }
        return appointment;
      });
      
      set({ appointments: updatedAppointments, loading: false });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update appointment', 
        loading: false 
      });
      return false;
    }
  },
  
  cancelAppointment: async (id) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedAppointments = get().appointments.map(appointment => {
        if (appointment.id === id) {
          return { ...appointment, status: 'cancelled' };
        }
        return appointment;
      });
      
      set({ appointments: updatedAppointments, loading: false });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to cancel appointment', 
        loading: false 
      });
      return false;
    }
  },

  canScheduleAppointment: (userId: number, userRole: string, patientId: number) => {
    // Technicians can schedule appointments for any patient
    if (userRole === 'technician') {
      return true;
    }
    
    // Patients can only schedule appointments for themselves
    if (userRole === 'patient') {
      return userId === patientId;
    }
    
    return false;
  }
}));