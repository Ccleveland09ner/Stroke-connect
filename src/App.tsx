import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/PatientList';
import PatientDetail from './pages/PatientDetail';
import AppointmentScheduler from './pages/AppointmentScheduler';
import NotificationsPage from './pages/NotificationsPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  const { isAuthenticated, role } = useAuthStore();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Routes accessible to Neurologists and Technicians */}
          {(role === 'neurologist' || role === 'technician') && (
            <>
              <Route path="/patients" element={<PatientList />} />
              <Route path="/patients/:id" element={<PatientDetail />} />
              <Route path="/notifications" element={<NotificationsPage />} />
            </>
          )}
          
          {/* Routes accessible only to Neurologists */}
          {role === 'neurologist' && (
            <Route path="/appointments" element={<AppointmentScheduler />} />
          )}
          
          {/* Patient can only see their own details */}
          {role === 'patient' && (
            <Route path="/my-record" element={<PatientDetail />} />
          )}
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;