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
  neurologistName?: string;
  diagnosis?: string;
  treatment?: string;
  tpaEligible?: boolean;
  tpaDecision?: 'approved' | 'denied';
  tpaDecisionReason?: string;
  notes: string;
}
