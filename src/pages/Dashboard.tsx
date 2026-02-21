import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  Calendar, 
  AlertTriangle,
  Activity,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuthStore } from '../stores/authStore';
import { usePatientStore, Patient } from '../stores/patientStore';
import { useAppointmentStore, Appointment } from '../stores/appointmentStore';
import { useNotificationStore, Notification } from '../stores/notificationStore';

const Dashboard: React.FC = () => {
  const { role, user } = useAuthStore();
  const { patients, myPatient, fetchPatients, fetchMyRecord } = usePatientStore();
  const { appointments, fetchAppointments } = useAppointmentStore();
  const { notifications, fetchNotifications } = useNotificationStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (role === 'neurologist' || role === 'technician') {
        await Promise.all([
          fetchPatients(),
          fetchNotifications(),
          role === 'neurologist' ? fetchAppointments() : Promise.resolve()
        ]);
      } else if (role === 'patient' && user?.name) {
        await fetchMyRecord(user.name);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [fetchPatients, fetchMyRecord, fetchNotifications, fetchAppointments, role, user?.name]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-full bg-primary-200 h-12 w-12 mb-4"></div>
          <div className="h-4 bg-primary-200 rounded w-24 mb-2.5"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  const patientsByStatus = {
    waiting: patients.filter(p => p.status === 'waiting'),
    treatmentPending: patients.filter(p => p.status === 'treatment-pending'),
    treated: patients.filter(
      p => ['treatment-approved', 'treatment-denied', 'discharged'].includes(p.status)
    ),
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const todayAppointments = appointments.filter(
    a => a.date === new Date().toISOString().split('T')[0] && a.status === 'scheduled'
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Role-based welcome message */}
      <Card>
        <CardContent className="py-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-100 rounded-full p-3">
              <Activity className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-5">
              <h2 className="text-lg font-medium text-gray-900">
                Welcome back, {user?.name}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {role === 'neurologist' && 'You have patients waiting for assessment and tPA approval.'}
                {role === 'technician' && 'You have patients that need data collection and monitoring.'}
                {role === 'patient' && 'Your medical information and status is available here.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Different dashboard content based on role */}
      {(role === 'neurologist' || role === 'technician') && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Patients awaiting assessment */}
          <Card className="border-l-4 border-warning-500">
            <CardContent className="py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-warning-500" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">
                    Awaiting Assessment
                  </h3>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-2xl font-semibold text-warning-600">
                      {patientsByStatus.waiting.length}
                    </p>
                    <p className="ml-2 text-sm text-gray-600">patients</p>
                  </div>
                </div>
              </div>
              {patientsByStatus.waiting.length > 0 && (
                <div className="mt-4">
                  <Link to="/patients">
                    <Button size="sm" variant="warning" className="w-full">
                      View Patients
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending treatment approval - more relevant for neurologists */}
          <Card className="border-l-4 border-primary-500">
            <CardContent className="py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-primary-500" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">
                    Pending Treatment
                  </h3>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-2xl font-semibold text-primary-600">
                      {patientsByStatus.treatmentPending.length}
                    </p>
                    <p className="ml-2 text-sm text-gray-600">patients</p>
                  </div>
                </div>
              </div>
              {patientsByStatus.treatmentPending.length > 0 && (
                <div className="mt-4">
                  <Link to="/patients">
                    <Button size="sm" variant="primary" className="w-full">
                      Review Cases
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's appointments - for neurologists */}
          {role === 'neurologist' && (
            <Card className="border-l-4 border-secondary-500">
              <CardContent className="py-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-8 w-8 text-secondary-500" />
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">
                      Today's Appointments
                    </h3>
                    <div className="mt-1 flex items-baseline">
                      <p className="text-2xl font-semibold text-secondary-600">
                        {todayAppointments.length}
                      </p>
                      <p className="ml-2 text-sm text-gray-600">scheduled</p>
                    </div>
                  </div>
                </div>
                {todayAppointments.length > 0 && (
                  <div className="mt-4">
                    <Link to="/appointments">
                      <Button size="sm" variant="secondary" className="w-full">
                        View Schedule
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notifications - for both neurologists and technicians */}
          {role === 'technician' && (
            <Card className="border-l-4 border-accent-500">
              <CardContent className="py-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-accent-500" />
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">
                      Total Patients
                    </h3>
                    <div className="mt-1 flex items-baseline">
                      <p className="text-2xl font-semibold text-accent-600">
                        {patients.length}
                      </p>
                      <p className="ml-2 text-sm text-gray-600">in database</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Link to="/patients">
                    <Button size="sm" variant="outline" className="w-full">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Patient-specific view */}
      {role === 'patient' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Your Medical Status</h2>
            </CardHeader>
            <CardContent>
              {myPatient ? (
                <div className="divide-y divide-gray-200">
                  <div className="py-4 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="text-sm text-gray-900 capitalize">{myPatient.status?.replace('-', ' ')}</dd>
                  </div>
                  <div className="py-4 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Date of Admission</dt>
                    <dd className="text-sm text-gray-900">{myPatient.dateOfAdmission}</dd>
                  </div>
                  <div className="py-4 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">NIHSS Score</dt>
                    <dd className="text-sm text-gray-900">{myPatient.nihssScore} - {myPatient.nihssScore <= 4 ? 'Minor' : myPatient.nihssScore <= 15 ? 'Moderate' : 'Severe'} Stroke</dd>
                  </div>
                  <div className="py-4 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Assigned Neurologist</dt>
                    <dd className="text-sm text-gray-900">{myPatient.neurologistName ?? '—'}</dd>
                  </div>
                  <div className="pt-4">
                    <Link to="/my-record">
                      <Button className="w-full">View My Complete Record</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No medical records found.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent activity section for all roles */}
      <div className="mt-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        
        {role === 'neurologist' && (
          <div className="space-y-4">
            {unreadNotifications.length > 0 ? (
              unreadNotifications.slice(0, 3).map((notification) => (
                <ActivityItem key={notification.id} notification={notification} />
              ))
            ) : (
              <p className="text-gray-500 text-sm">No recent activity.</p>
            )}
            
            {unreadNotifications.length > 3 && (
              <div className="text-center mt-4">
                <Link to="/notifications">
                  <Button variant="outline" size="sm">
                    View All Notifications
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
        
        {role === 'technician' && (
          <div className="space-y-4">
            {patients.slice(0, 3).map((patient) => (
              <PatientActivityItem key={patient.id} patient={patient} />
            ))}
          </div>
        )}
        
        {role === 'patient' && (
          <div className="text-gray-500 text-sm">
            <p>Your medical team is monitoring your condition. Any updates will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper component for activity items
const ActivityItem: React.FC<{ notification: Notification }> = ({ notification }) => {
  const iconMap = {
    alert: <AlertTriangle className="h-5 w-5 text-error-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-warning-500" />,
    info: <Activity className="h-5 w-5 text-primary-500" />,
  };

  return (
    <div className="bg-white shadow-sm rounded-md p-4 flex">
      <div className="flex-shrink-0 mr-4">
        {iconMap[notification.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">
          {notification.message}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(notification.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

// Helper component for patient activity items
const PatientActivityItem: React.FC<{ patient: Patient }> = ({ patient }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Clock className="h-5 w-5 text-warning-500" />;
      case 'treatment-approved':
        return <CheckCircle2 className="h-5 w-5 text-success-500" />;
      case 'treatment-denied':
        return <XCircle className="h-5 w-5 text-error-500" />;
      default:
        return <Activity className="h-5 w-5 text-primary-500" />;
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-md p-4 flex">
      <div className="flex-shrink-0 mr-4">
        {getStatusIcon(patient.status)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">
          {patient.name} - NIHSS: {patient.nihssScore}
        </p>
        <p className="text-xs text-gray-500 mt-1 capitalize">
          Status: {patient.status.replace('-', ' ')}
        </p>
      </div>
      <div className="ml-2">
        <Link to={`/patients/${patient.id}`}>
          <Button variant="outline" size="sm">View</Button>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;