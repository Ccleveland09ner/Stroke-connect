import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Filter, ArrowUpDown } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import AddPatientForm from '../components/AddPatientForm';
import Alert from '../components/ui/Alert';
import { usePatientStore, Patient } from '../stores/patientStore';
import { useAuthStore } from '../stores/authStore';
import { formatNIHSSScore, formatStatus } from '../utils/formatUtils';

const PatientList: React.FC = () => {
  const { patients, fetchPatients, loading, addPatient, isMutating, error } = usePatientStore();
  const { role } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleAddPatient = async (patientData: any) => {
    const success = await addPatient({
      ...patientData,
      dateOfAdmission: new Date().toISOString().split('T')[0],
      status: 'waiting',
      nihssScore: 0,
      imagingResults: [],
      notes: '',
      vitalSigns: {
        bloodPressure: '',
        heartRate: 0,
        oxygenSaturation: 0
      }
    });

    if (success) {
      setShowAddForm(false);
    }
  };

  // Filter and sort patients
  const filteredPatients = patients
    .filter(patient => {
      const matchesSearch = 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.medicalRecordNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = 
        filter === 'all' || 
        (filter === 'waiting' && patient.status === 'waiting') ||
        (filter === 'treatment-pending' && patient.status === 'treatment-pending') ||
        (filter === 'treated' && ['treatment-approved', 'treatment-denied', 'discharged'].includes(patient.status));
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'nihssScore':
          comparison = a.nihssScore - b.nihssScore;
          break;
        case 'dateOfAdmission':
          comparison = new Date(a.dateOfAdmission).getTime() - new Date(b.dateOfAdmission).getTime();
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        {role === 'technician' && (
          <Button onClick={() => setShowAddForm(true)} disabled={isMutating}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Patient
          </Button>
        )}
      </div>

      {/* Search and filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Patients</option>
            <option value="waiting">Awaiting Assessment</option>
            <option value="treatment-pending">Pending Treatment</option>
            <option value="treated">Treated</option>
          </select>
        </div>
      </div>

      {/* Patient list */}
      <Card>
        <CardHeader className="bg-gray-50 px-4 py-5 border-b border-gray-200 sm:px-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Patient List
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filteredPatients.length} patients
            </p>
          </div>
        </CardHeader>
        <CardContent className="px-0 py-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Patient Name
                      {sortBy === 'name' && (
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    MRN
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('nihssScore')}
                  >
                    <div className="flex items-center">
                      NIHSS Score
                      {sortBy === 'nihssScore' && (
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('dateOfAdmission')}
                  >
                    <div className="flex items-center">
                      Admission Date
                      {sortBy === 'dateOfAdmission' && (
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No patients found.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <PatientRow key={patient.id} patient={patient} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Patient Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full">
            <AddPatientForm
              onSubmit={handleAddPatient}
              onClose={() => setShowAddForm(false)}
              isLoading={isMutating}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const PatientRow: React.FC<{ patient: Patient }> = ({ patient }) => {
  const nihssFormatted = formatNIHSSScore(patient.nihssScore);
  const statusFormatted = formatStatus(patient.status);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div>
            <div className="text-sm font-medium text-gray-900">{patient.name}</div>
            <div className="text-sm text-gray-500">
              {patient.age} years, {patient.gender}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{patient.medicalRecordNumber}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{patient.nihssScore}</div>
        <div className={`text-xs ${nihssFormatted.color}`}>
          {nihssFormatted.text}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{patient.dateOfAdmission}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge className={statusFormatted.color}>
          {statusFormatted.text}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <Link
          to={`/patients/${patient.id}`}
          className="text-primary-600 hover:text-primary-900"
        >
          View
        </Link>
      </td>
    </tr>
  );
};

export default PatientList;