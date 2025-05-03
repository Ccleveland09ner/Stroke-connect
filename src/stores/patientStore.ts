import { create } from 'zustand';
import { format } from 'date-fns';

export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  medicalRecordNumber: string;
  dateOfAdmission: string;
  chiefComplaint: string;
  vitalSigns: {
    bloodPressure: string;
    heartRate: number;
    oxygenSaturation: number;
  };
  nihssScore: number;
  status: 'waiting' | 'diagnosed' | 'treatment-pending' | 'treatment-approved' | 'treatment-denied' | 'discharged';
  imagingResults: string[];
  assignedNeurologist?: number;
  diagnosis?: string;
  treatment?: string;
  tpaEligible?: boolean;
  tpaDecision?: 'approved' | 'denied';
  tpaDecisionReason?: string;
  notes: string;
}

interface PatientState {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  fetchPatients: () => Promise<void>;
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

// Mock data for demonstration
const mockPatients: Patient[] = [
  {
    id: 1,
    name: 'John Doe',
    age: 67,
    gender: 'male',
    medicalRecordNumber: 'MRN12345',
    dateOfAdmission: format(new Date(), 'yyyy-MM-dd'),
    chiefComplaint: 'Sudden left-sided weakness and facial droop',
    vitalSigns: {
      bloodPressure: '160/90',
      heartRate: 92,
      oxygenSaturation: 96,
    },
    nihssScore: 14,
    status: 'waiting',
    imagingResults: ['CT scan shows no hemorrhage', 'CTA shows M1 occlusion'],
    assignedNeurologist: 1,
    notes: 'Patient arrived 45 minutes after symptom onset.'
  },
  {
    id: 2,
    name: 'Jane Smith',
    age: 73,
    gender: 'female',
    medicalRecordNumber: 'MRN12346',
    dateOfAdmission: format(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    chiefComplaint: 'Slurred speech and right arm weakness',
    vitalSigns: {
      bloodPressure: '145/85',
      heartRate: 88,
      oxygenSaturation: 98,
    },
    nihssScore: 8,
    status: 'diagnosed',
    diagnosis: 'Acute ischemic stroke',
    treatment: 'Consider tPA administration',
    tpaEligible: true,
    imagingResults: ['CT scan negative for hemorrhage', 'MRI shows acute infarct in left MCA territory'],
    assignedNeurologist: 1,
    notes: 'Last known well 3 hours prior to arrival.'
  },
  {
    id: 3,
    name: 'Robert Johnson',
    age: 58,
    gender: 'male',
    medicalRecordNumber: 'MRN12347',
    dateOfAdmission: format(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    chiefComplaint: 'Dizziness, nausea, and difficulty walking',
    vitalSigns: {
      bloodPressure: '170/95',
      heartRate: 78,
      oxygenSaturation: 97,
    },
    nihssScore: 5,
    status: 'treatment-approved',
    diagnosis: 'Acute ischemic stroke',
    treatment: 'Administer tPA',
    tpaEligible: true,
    tpaDecision: 'approved',
    tpaDecisionReason: 'Patient meets all criteria for tPA administration',
    imagingResults: ['CT scan negative', 'MRI confirms right cerebellar infarct'],
    assignedNeurologist: 1,
    notes: 'Patient has history of hypertension and diabetes.'
  },
  {
    id: 4,
    name: 'Jamie Smith',
    age: 52,
    gender: 'female',
    medicalRecordNumber: 'MRN12348',
    dateOfAdmission: format(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    chiefComplaint: 'Sudden severe headache and vomiting',
    vitalSigns: {
      bloodPressure: '180/100',
      heartRate: 102,
      oxygenSaturation: 95,
    },
    nihssScore: 10,
    status: 'treatment-denied',
    diagnosis: 'Hemorrhagic stroke',
    treatment: 'Blood pressure control and supportive care',
    tpaEligible: false,
    tpaDecision: 'denied',
    tpaDecisionReason: 'Hemorrhagic stroke on imaging',
    imagingResults: ['CT shows subarachnoid hemorrhage', 'CTA confirms right MCA aneurysm'],
    assignedNeurologist: 1,
    notes: 'Patient transferred for neurosurgical evaluation.'
  }
];

export const usePatientStore = create<PatientState>((set, get) => ({
  patients: [],
  loading: false,
  error: null,
  
  fetchPatients: async () => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ patients: mockPatients, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch patients', 
        loading: false 
      });
    }
  },
  
  getPatientById: (id) => {
    return get().patients.find(patient => patient.id === id);
  },
  
  updatePatient: async (id, data) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedPatients = get().patients.map(patient => {
        if (patient.id === id) {
          return { ...patient, ...data };
        }
        return patient;
      });
      
      set({ patients: updatedPatients, loading: false });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update patient', 
        loading: false 
      });
      return false;
    }
  },
  
  addPatient: async (patientData) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newPatient: Patient = {
        ...patientData,
        id: Math.max(...get().patients.map(p => p.id)) + 1,
      };
      
      set(state => ({ 
        patients: [...state.patients, newPatient],
        loading: false 
      }));
      
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add patient', 
        loading: false 
      });
      return false;
    }
  },

  updateDiagnosisAndTreatment: async (id, diagnosis, treatment, tpaEligible) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedPatients = get().patients.map(patient => {
        if (patient.id === id) {
          return {
            ...patient,
            diagnosis,
            treatment,
            tpaEligible,
            status: 'diagnosed',
            notes: `${patient.notes}\n[${new Date().toISOString()}] Diagnosis and treatment plan added.`
          };
        }
        return patient;
      });
      
      set({ patients: updatedPatients, loading: false });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update diagnosis and treatment', 
        loading: false 
      });
      return false;
    }
  },

  makeTpaDecision: async (id, decision, reason) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedPatients = get().patients.map(patient => {
        if (patient.id === id) {
          return {
            ...patient,
            tpaDecision: decision,
            tpaDecisionReason: reason,
            status: decision === 'approved' ? 'treatment-approved' : 'treatment-denied',
            notes: `${patient.notes}\n[${new Date().toISOString()}] tPA ${decision}: ${reason}`
          };
        }
        return patient;
      });
      
      set({ patients: updatedPatients, loading: false });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to make tPA decision', 
        loading: false 
      });
      return false;
    }
  }
}));