import React, { useEffect, useState } from 'react';
import { Calendar, Clock, User, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAppointmentStore } from '../stores/appointmentStore';
import { usePatientStore } from '../stores/patientStore';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';

const AppointmentScheduler: React.FC = () => {
  const { appointments, fetchAppointments, addAppointment, updateAppointment, cancelAppointment, isMutating, mutatingId, error } = useAppointmentStore();
  const { patients, fetchPatients } = usePatientStore();
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    type: 'follow-up',
    reason: '',
    notes: '',
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAppointments(), fetchPatients()]);
      setLoading(false);
    };

    loadData();
  }, [fetchAppointments, fetchPatients]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const patientId = parseInt(formData.patientId);
    const patient = patients.find(p => p.id === patientId);
    
    if (patient) {
      await addAppointment({
        patientId,
        patientName: patient.name,
        date: formData.date,
        time: formData.time,
        type: formData.type as any,
        notes: formData.notes,
        status: 'scheduled'
      });
      
      // Reset form and hide it
      setFormData({
        patientId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '09:00',
        type: 'follow-up',
        reason: '',
        notes: '',
      });
      setShowAddForm(false);
    }
  };

  const handleCancel = async (id: number) => {
    await cancelAppointment(id);
  };

  const handleComplete = async (id: number) => {
    await updateAppointment(id, { status: 'completed' });
  };

  // Group appointments by date
  const groupedAppointments = appointments.reduce((acc, appointment) => {
    const date = appointment.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(appointment);
    return acc;
  }, {} as Record<string, typeof appointments>);

  // Sort dates
  const sortedDates = Object.keys(groupedAppointments).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 bg-primary-200 rounded w-32 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mb-2.5"></div>
          <div className="h-4 bg-gray-200 rounded w-56"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {error && (
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      )}
      <div className="flex flex-wrap items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Appointment Scheduler</h1>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </>
          )}
        </Button>
      </div>

      {/* Add appointment form */}
      {showAddForm && (
        <Card className="mb-6">
          <CardHeader className="bg-gray-50 border-b">
            <h3 className="text-lg font-medium text-gray-900">Schedule New Appointment</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">Patient</label>
                <select
                  id="patientId"
                  name="patientId"
                  required
                  value={formData.patientId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">Select a patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} ({patient.medicalRecordNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700">Time</label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    required
                    value={formData.time}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason for Visit</label>
                <input
                  type="text"
                  id="reason"
                  name="reason"
                  required
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Brief description of the reason for the appointment"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Additional Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Any additional information or special requirements"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" isLoading={isMutating} disabled={isMutating}>
                  Schedule Appointment
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Appointments list */}
      <div className="space-y-6">
        {sortedDates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No appointments scheduled</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new appointment.</p>
              <div className="mt-6">
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          sortedDates.map(date => {
            const dateObj = parseISO(date);
            let dateLabel = format(dateObj, 'EEEE, MMMM d, yyyy');
            
            if (isToday(dateObj)) {
              dateLabel = `Today - ${format(dateObj, 'MMMM d, yyyy')}`;
            } else if (isTomorrow(dateObj)) {
              dateLabel = `Tomorrow - ${format(dateObj, 'MMMM d, yyyy')}`;
            }
            
            return (
              <div key={date}>
                <h2 className="text-lg font-medium text-gray-900 mb-3">{dateLabel}</h2>
                <Card>
                  <CardContent className="px-0 py-0">
                    <ul className="divide-y divide-gray-200">
                      {groupedAppointments[date]
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map(appointment => (
                          <AppointmentItem 
                            key={appointment.id}
                            appointment={appointment}
                            onCancel={() => handleCancel(appointment.id)}
                            onComplete={() => handleComplete(appointment.id)}
                            isMutating={mutatingId === appointment.id}
                          />
                        ))
                      }
                    </ul>
                  </CardContent>
                </Card>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

interface AppointmentItemProps {
  appointment: {
    id: number;
    patientId: number;
    patientName: string;
    date: string;
    time: string;
    type: string;
    notes: string;
    status: string;
  };
  onCancel: () => void;
  onComplete: () => void;
  isMutating?: boolean;
}

const AppointmentItem: React.FC<AppointmentItemProps> = ({ 
  appointment, 
  onCancel,
  onComplete,
  isMutating = false
}) => {
  const { date, time, patientName, type, status, notes } = appointment;
  
  const formattedTime = time;
  
  const typeVariant = {
    'initial': 'primary',
    'follow-up': 'secondary',
    'emergency': 'error'
  }[type] || 'primary';
  
  const statusVariant = {
    'scheduled': 'warning',
    'completed': 'success',
    'cancelled': 'error'
  }[status] || 'warning';
  
  const isScheduled = status === 'scheduled';

  return (
    <li className="px-4 py-4 sm:px-6 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Clock className="h-6 w-6 text-gray-400" />
          </div>
          <div className="ml-4">
            <div className="flex items-center">
              <p className="text-sm font-medium text-gray-900">{formattedTime}</p>
              <div className="ml-2 flex">
                <Badge variant={typeVariant as any} className="mr-2 capitalize">
                  {type.replace('-', ' ')}
                </Badge>
                <Badge variant={statusVariant as any} className="capitalize">
                  {status}
                </Badge>
              </div>
            </div>
            <div className="flex items-center mt-1">
              <User className="h-4 w-4 text-gray-400 mr-1" />
              <p className="text-sm text-gray-500">{patientName}</p>
            </div>
            {notes && (
              <p className="mt-1 text-sm text-gray-500 line-clamp-1">{notes}</p>
            )}
          </div>
        </div>
        
        {isScheduled && (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onCancel}
              disabled={isMutating}
              isLoading={isMutating}
            >
              Cancel
            </Button>
            <Button 
              variant="success" 
              size="sm"
              onClick={onComplete}
              disabled={isMutating}
              isLoading={isMutating}
            >
              Complete
            </Button>
          </div>
        )}
      </div>
    </li>
  );
};

export default AppointmentScheduler;