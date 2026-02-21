import { create } from 'zustand';
import * as patientsApi from '../api/patients';
import type { Patient } from '../types/patient';

interface PatientState {
  patients: Patient[];
  myPatient: Patient | null;
  loading: boolean;
  isMutating: boolean;
  error: string | null;
  fetchPatients: () => Promise<void>;
  fetchMyRecord: (userName: string) => Promise<void>;
  getPatientById: (id: number) => Patient | undefined;
  updatePatient: (id: number, data: Partial<Patient>) => Promise<boolean>;
  addPatient: (patient: Omit<Patient, 'id'>) => Promise<boolean>;
  updateDiagnosisAndTreatment: (
    id: number,
    diagnosis: string,
    treatment: string,
    tpaEligible: boolean
  ) => Promise<boolean>;
  makeTpaDecision: (
    id: number,
    decision: 'approved' | 'denied',
    reason: string
  ) => Promise<boolean>;
}

function normalizePatient(p: Patient): Patient {
  return {
    ...p,
    vitalSigns: p.vitalSigns || { bloodPressure: '', heartRate: 0, oxygenSaturation: 0 },
    imagingResults: p.imagingResults || [],
    notes: p.notes ?? '',
  };
}

export const usePatientStore = create<PatientState>((set, get) => ({
  patients: [],
  myPatient: null,
  loading: false,
  isMutating: false,
  error: null,

  fetchPatients: async () => {
    set({ loading: true, error: null });
    try {
      const res = await patientsApi.getPatients();
      if (res.success && res.patients) {
        set({
          patients: res.patients.map(normalizePatient),
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch patients';
      console.error('[patientStore] fetchPatients failed:', err);
      set({ error: message, loading: false });
    }
  },

  fetchMyRecord: async (userName) => {
    set({ loading: true, error: null });
    try {
      const res = await patientsApi.getMyRecord(userName);
      if (res.success && res.patient) {
        set({
          myPatient: normalizePatient(res.patient),
          loading: false,
        });
      } else {
        set({ myPatient: null, loading: false });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch record';
      console.error('[patientStore] fetchMyRecord failed:', err);
      set({
        error: message,
        myPatient: null,
        loading: false,
      });
    }
  },

  getPatientById: (id) => {
    const fromList = get().patients.find((p) => p.id === id);
    if (fromList) return fromList;
    const my = get().myPatient;
    return my && my.id === id ? my : undefined;
  },

  updatePatient: async (id, data) => {
    set({ isMutating: true, error: null });
    const prevPatients = get().patients;
    const prevMyPatient = get().myPatient;

    const applyOptimistic = () => {
      const updated = prevPatients.map((p) =>
        p.id === id ? { ...p, ...data } : p
      );
      set({ patients: updated });
      if (prevMyPatient?.id === id) {
        set({ myPatient: { ...prevMyPatient, ...data } });
      }
    };

    applyOptimistic();

    try {
      const res = await patientsApi.updatePatient(id, data);
      if (res.success) {
        await get().fetchPatients();
        if (prevMyPatient?.id === id) {
          const userName = prevMyPatient.name;
          await get().fetchMyRecord(userName);
        }
        set({ isMutating: false });
        return true;
      }
      set({ patients: prevPatients, myPatient: prevMyPatient, isMutating: false });
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update patient';
      console.error('[patientStore] updatePatient failed:', err);
      set({
        patients: prevPatients,
        myPatient: prevMyPatient,
        error: message,
        isMutating: false,
      });
      return false;
    }
  },

  addPatient: async (patientData) => {
    set({ isMutating: true, error: null });
    const tempId = -Date.now();
    const newPatient: Patient = {
      ...(patientData as Patient),
      id: tempId,
      vitalSigns: patientData.vitalSigns || { bloodPressure: '', heartRate: 0, oxygenSaturation: 0 },
      imagingResults: patientData.imagingResults || [],
      notes: patientData.notes ?? '',
    };
    const prevPatients = get().patients;
    set({ patients: [newPatient, ...prevPatients] });

    try {
      const res = await patientsApi.addPatient(patientData as Parameters<typeof patientsApi.addPatient>[0]);
      if (res.success && res.patientId) {
        await get().fetchPatients();
        set({ isMutating: false });
        return true;
      }
      set({ patients: prevPatients, isMutating: false });
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add patient';
      console.error('[patientStore] addPatient failed:', err);
      set({
        patients: prevPatients,
        error: message,
        isMutating: false,
      });
      return false;
    }
  },

  updateDiagnosisAndTreatment: async (id, diagnosis, treatment, tpaEligible) => {
    return get().updatePatient(id, {
      diagnosis,
      treatment,
      tpaEligible,
      status: 'diagnosed',
    });
  },

  makeTpaDecision: async (id, decision, reason) => {
    return get().updatePatient(id, {
      tpaDecision: decision,
      tpaDecisionReason: reason,
      status: decision === 'approved' ? 'treatment-approved' : 'treatment-denied',
    });
  },
}));

export type { Patient };
