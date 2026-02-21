import { create } from 'zustand';
import * as appointmentsApi from '../api/appointments';
import type { Appointment } from '../types/appointment';

interface AppointmentState {
  appointments: Appointment[];
  loading: boolean;
  isMutating: boolean;
  mutatingId: number | null;
  error: string | null;
  fetchAppointments: () => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<boolean>;
  updateAppointment: (id: number, data: Partial<Appointment>) => Promise<boolean>;
  cancelAppointment: (id: number) => Promise<boolean>;
  canScheduleAppointment: (userId: number, userRole: string, patientId: number) => boolean;
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  loading: false,
  isMutating: false,
  mutatingId: null,
  error: null,

  fetchAppointments: async () => {
    set({ loading: true, error: null });
    try {
      const res = await appointmentsApi.getAppointments();
      if (res.success && res.appointments) {
        set({
          appointments: res.appointments,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch appointments';
      console.error('[appointmentStore] fetchAppointments failed:', err);
      set({ error: message, loading: false });
    }
  },

  addAppointment: async (appointmentData) => {
    set({ isMutating: true, error: null });
    const tempId = -Date.now();
    const newAppointment: Appointment = {
      ...appointmentData,
      id: tempId,
    };
    const prevAppointments = get().appointments;
    set({ appointments: [newAppointment, ...prevAppointments] });

    try {
      const res = await appointmentsApi.addAppointment({
        patientId: appointmentData.patientId,
        date: appointmentData.date,
        time: appointmentData.time,
        type: appointmentData.type,
        notes: appointmentData.notes,
        status: appointmentData.status ?? 'scheduled',
      });
      if (res.success) {
        await get().fetchAppointments();
        set({ isMutating: false });
        return true;
      }
      set({ appointments: prevAppointments, isMutating: false });
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add appointment';
      console.error('[appointmentStore] addAppointment failed:', err);
      set({
        appointments: prevAppointments,
        error: message,
        isMutating: false,
      });
      return false;
    }
  },

  updateAppointment: async (id, data) => {
    set({ isMutating: true, mutatingId: id, error: null });
    const prevAppointments = get().appointments;

    const applyOptimistic = () => {
      const updated = prevAppointments.map((a) =>
        a.id === id ? { ...a, ...data } : a
      );
      set({ appointments: updated });
    };

    applyOptimistic();

    try {
      const res = await appointmentsApi.updateAppointment(id, data);
      if (res.success) {
        await get().fetchAppointments();
        set({ isMutating: false, mutatingId: null });
        return true;
      }
      set({ appointments: prevAppointments, isMutating: false, mutatingId: null });
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update appointment';
      console.error('[appointmentStore] updateAppointment failed:', err);
      set({
        appointments: prevAppointments,
        error: message,
        isMutating: false,
        mutatingId: null,
      });
      return false;
    }
  },

  cancelAppointment: async (id) => {
    return get().updateAppointment(id, { status: 'cancelled' });
  },

  canScheduleAppointment: (userId: number, userRole: string, patientId: number) => {
    if (userRole === 'technician') return true;
    if (userRole === 'patient') return userId === patientId;
    return false;
  },
}));

export type { Appointment };
