export type Role = 'neurologist' | 'technician' | 'patient' | null;

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  username?: string;
  medications?: string;
  medicalHistory?: string;
}

export interface RegisterData {
  name: string;
  password: string;
  email: string;
  role: Role;
  username?: string;
  medications?: string;
  medicalHistory?: string;
}
