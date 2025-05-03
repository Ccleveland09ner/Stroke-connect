import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'neurologist' | 'technician' | 'patient' | null;

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  medications?: string;
  medicalHistory?: string;
}

interface RegisterData {
  name: string;
  password: string;
  email: string;
  role: Role;
  medications?: string;
  medicalHistory?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  role: Role;
  login: (name: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
}

// Mock database of registered users
let registeredUsers: User[] = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    email: 'neurologist@example.com',
    role: 'neurologist',
  },
  {
    id: 2,
    name: 'Alex Rodriguez',
    email: 'technician@example.com',
    role: 'technician',
  },
  {
    id: 3,
    name: 'Jamie Smith',
    email: 'patient@example.com',
    role: 'patient',
  }
];

// Mock password storage (in a real app, passwords would be hashed)
const userPasswords: Record<string, string> = {
  'Dr. Sarah Johnson': 'password',
  'Alex Rodriguez': 'password',
  'Jamie Smith': 'password',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      role: null,
      
      login: async (name: string, password: string) => {
        const user = registeredUsers.find(u => u.name === name);
        const storedPassword = userPasswords[name];
        
        if (user && storedPassword === password) {
          set({
            user,
            token: 'mock-jwt-token',
            isAuthenticated: true,
            role: user.role,
          });
          return true;
        }
        
        return false;
      },

      register: async (data: RegisterData) => {
        // Check if name already exists
        if (registeredUsers.some(u => u.name === data.name)) {
          return false;
        }

        // For patients, verify if the name exists in the patient database
        if (data.role === 'patient') {
          const patientExists = mockPatients.some(
            p => p.name.toLowerCase() === data.name.toLowerCase()
          );
          if (!patientExists) {
            return false;
          }
        }

        // Create new user
        const newUser: User = {
          id: registeredUsers.length + 1,
          name: data.name,
          email: data.email,
          role: data.role,
          medications: data.medications,
          medicalHistory: data.medicalHistory,
        };

        // Store password
        userPasswords[data.name] = data.password;

        // Add user to registered users
        registeredUsers = [...registeredUsers, newUser];

        // Log in the user immediately after registration
        set({
          user: newUser,
          token: 'mock-jwt-token',
          isAuthenticated: true,
          role: newUser.role,
        });

        return true;
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          role: null,
        });
      },
    }),
    {
      name: 'stroke-app-auth',
    }
  )
);

// Mock patient database for verification
const mockPatients = [
  { name: 'John Doe' },
  { name: 'Jane Smith' },
  { name: 'Robert Johnson' },
  { name: 'Jamie Smith' },
];