import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Activity, 
  User, 
  ClipboardList,
  BrainCircuit,
  Calendar,
  ListChecks,
  CheckCircle,
  XCircle,
  Edit,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Alert from '../components/ui/Alert';
import DiagnosisTreatmentForm from '../components/DiagnosisTreatmentForm';
import TPADecisionForm from '../components/TPADecisionForm';
import NIHSSCalculator from '../components/NIHSSCalculator';
import { usePatientStore } from '../stores/patientStore';
import { useAuthStore } from '../stores/authStore';
import { formatNIHSSScore, formatStatus } from '../utils/formatUtils';

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { patients, getPatientById, fetchPatients, updatePatient } = usePatientStore();
  const { role, user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<any>(null);
  const [showDiagnosisForm, setShowDiagnosisForm] = useState(false);
  const [showTPAForm, setShowTPAForm] = useState(false);
  const [showNIHSSCalculator, setShowNIHSSCalculator] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchPatients();
      const patientId = role === 'patient' ? 4 : parseInt(id || '0');
      const patientData = getPatientById(patientId);
      if (patientData) {
        setPatient(patientData);
        setFormData(patientData);
      }
      setLoading(false);
    };
    loadData();
  }, [id, fetchPatients, getPatientById, role]);

  const handleDiagnosisSubmit = async (diagnosis: string, treatment: string, tpaEligible: boolean) => {
    if (patient) {
      await updatePatient(patient.id, {
        diagnosis,
        treatment,
        tpaEligible,
        status: 'diagnosed'
      });
      setShowDiagnosisForm(false);
      setShowTPAForm(true);
      const updatedPatient = getPatientById(patient.id);
      setPatient(updatedPatient);
    }
  };

  const handleTPADecision = async (decision: 'approved' | 'denied', reason: string) => {
    if (patient) {
      await updatePatient(patient.id, {
        status: decision === 'approved' ? 'treatment-approved' : 'treatment-denied',
        tpaDecision: decision,
        tpaDecisionReason: reason
      });
      setShowTPAForm(false);
      const updatedPatient = getPatientById(patient.id);
      setPatient(updatedPatient);
    }
  };

  const handleNIHSSSubmit = async (score: number) => {
    if (patient) {
      await updatePatient(patient.id, { nihssScore: score });
      setShowNIHSSCalculator(false);
      const updatedPatient = getPatientById(patient.id);
      setPatient(updatedPatient);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleApproveTPa = async () => {
    if (patient) {
      await updatePatient(patient.id, {
        status: 'treatment-approved',
        notes: patient.notes + '\nPatient approved for tPA treatment.'
      });
      
      const updatedPatient = getPatientById(patient.id);
      setPatient(updatedPatient);
    }
  };
  
  const handleDenyTPa = async () => {
    if (patient) {
      await updatePatient(patient.id, {
        status: 'treatment-denied',
        notes: patient.notes + '\nPatient not eligible for tPA treatment.'
      });
      
      const updatedPatient = getPatientById(patient.id);
      setPatient(updatedPatient);
    }
  };
  
  const handleSaveChanges = async () => {
    if (patient) {
      await updatePatient(patient.id, formData);
      
      const updatedPatient = getPatientById(patient.id);
      setPatient(updatedPatient);
      setIsEditing(false);
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
  
  if (!patient) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Patient Not Found</h2>
        <p className="text-gray-500 mb-6">The patient you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button onClick={() => navigate('/patients')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Patient List
        </Button>
      </div>
    );
  }
  
  const nihssFormatted = formatNIHSSScore(patient.nihssScore);
  const statusFormatted = formatStatus(patient.status);
  const isTPaPending = patient.status === 'treatment-pending';
  const showTPaButtons = role === 'neurologist' && isTPaPending;
  const canEdit = role === 'neurologist' || role === 'technician';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-wrap items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="sm" 
            className="mr-4"
            onClick={() => role === 'patient' ? navigate('/dashboard') : navigate('/patients')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {role === 'patient' ? 'Back to Dashboard' : 'Back to Patients'}
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            {role === 'patient' ? 'My Medical Record' : `Patient: ${patient.name}`}
          </h1>
        </div>
        {canEdit && (
          <div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Patient
              </Button>
            ) : (
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveChanges}>
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Patient status card */}
      <Card className="mb-6">
        <CardContent className="py-5">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-full p-3">
                <Activity className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5">
                <div className="flex items-center">
                  <Badge className={statusFormatted.color}>
                    {statusFormatted.text}
                  </Badge>
                  <span className="mx-3">•</span>
                  <span className={`text-sm font-medium ${nihssFormatted.color}`}>
                    NIHSS: {patient.nihssScore} - {nihssFormatted.text}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Admitted on {patient.dateOfAdmission}
                </p>
              </div>
            </div>
            
            {showTPaButtons && (
              <div className="flex space-x-2 mt-4 md:mt-0">
                <Button 
                  variant="danger" 
                  onClick={handleDenyTPa}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Deny tPA
                </Button>
                <Button 
                  variant="success"
                  onClick={handleApproveTPa}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve tPA
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Treatment and Diagnosis Section for Neurologist */}
      {role === 'neurologist' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="bg-gray-50 border-b">
              <h3 className="text-lg font-medium text-gray-900">Diagnosis & Treatment</h3>
            </CardHeader>
            <CardContent className="p-6">
              {patient.diagnosis ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Diagnosis</h4>
                    <p className="mt-1 text-sm text-gray-900">{patient.diagnosis}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Treatment Plan</h4>
                    <p className="mt-1 text-sm text-gray-900">{patient.treatment}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 mb-4">No diagnosis or treatment plan has been added yet.</p>
                  <Button onClick={() => setShowDiagnosisForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Diagnosis & Treatment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-gray-50 border-b">
              <h3 className="text-lg font-medium text-gray-900">tPA Status</h3>
            </CardHeader>
            <CardContent className="p-6">
              {patient.tpaDecision ? (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Badge
                      variant={patient.tpaDecision === 'approved' ? 'success' : 'error'}
                      className="text-sm"
                    >
                      tPA {patient.tpaDecision === 'approved' ? 'Approved' : 'Denied'}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Reason</h4>
                    <p className="mt-1 text-sm text-gray-900">{patient.tpaDecisionReason}</p>
                  </div>
                </div>
              ) : patient.diagnosis ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 mb-4">tPA decision pending.</p>
                  <Button onClick={() => setShowTPAForm(true)}>
                    Make tPA Decision
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500">
                    Add diagnosis and treatment plan first to make tPA decision.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* NIHSS Calculator for Technician */}
      {role === 'technician' && (
        <Card className="mb-6">
          <CardHeader className="bg-gray-50 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">NIHSS Score</h3>
              <Button onClick={() => setShowNIHSSCalculator(true)}>
                Calculate NIHSS Score
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {patient.nihssScore !== undefined ? (
              <div className="flex items-center space-x-2">
                <span className="text-lg font-medium">{patient.nihssScore}</span>
                <Badge variant={nihssFormatted.color as any}>
                  {nihssFormatted.text}
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No NIHSS score recorded yet.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Forms */}
      {showDiagnosisForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full">
            <DiagnosisTreatmentForm
              onSubmit={handleDiagnosisSubmit}
              onClose={() => setShowDiagnosisForm(false)}
            />
          </div>
        </div>
      )}

      {showTPAForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full">
            <TPADecisionForm
              onSubmit={handleTPADecision}
              onClose={() => setShowTPAForm(false)}
            />
          </div>
        </div>
      )}

      {showNIHSSCalculator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full">
            <NIHSSCalculator
              onScoreCalculated={handleNIHSSSubmit}
              onClose={() => setShowNIHSSCalculator(false)}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader className="bg-gray-50 border-b">
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
            </div>
          </CardHeader>
          <CardContent>
            {!isEditing ? (
              <div className="divide-y divide-gray-200">
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="text-sm text-gray-900">{patient.name}</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Age</dt>
                  <dd className="text-sm text-gray-900">{patient.age} years</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Gender</dt>
                  <dd className="text-sm text-gray-900 capitalize">{patient.gender}</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Medical Record #</dt>
                  <dd className="text-sm text-gray-900">{patient.medicalRecordNumber}</dd>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
                  <input
                    type="number"
                    name="age"
                    id="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    name="gender"
                    id="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="medicalRecordNumber" className="block text-sm font-medium text-gray-700">Medical Record #</label>
                  <input
                    type="text"
                    name="medicalRecordNumber"
                    id="medicalRecordNumber"
                    value={formData.medicalRecordNumber}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Clinical Information */}
        <Card>
          <CardHeader className="bg-gray-50 border-b">
            <div className="flex items-center">
              <ClipboardList className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Clinical Information</h3>
            </div>
          </CardHeader>
          <CardContent>
            {!isEditing ? (
              <div className="divide-y divide-gray-200">
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Chief Complaint</dt>
                  <dd className="text-sm text-gray-900">{patient.chiefComplaint}</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">BP</dt>
                  <dd className="text-sm text-gray-900">{patient.vitalSigns.bloodPressure}</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Heart Rate</dt>
                  <dd className="text-sm text-gray-900">{patient.vitalSigns.heartRate} bpm</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">O2 Saturation</dt>
                  <dd className="text-sm text-gray-900">{patient.vitalSigns.oxygenSaturation}%</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">NIHSS Score</dt>
                  <dd className={`text-sm ${nihssFormatted.color}`}>
                    {patient.nihssScore} - {nihssFormatted.text}
                  </dd>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="chiefComplaint" className="block text-sm font-medium text-gray-700">Chief Complaint</label>
                  <input
                    type="text"
                    name="chiefComplaint"
                    id="chiefComplaint"
                    value={formData.chiefComplaint}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="vitalSigns.bloodPressure" className="block text-sm font-medium text-gray-700">Blood Pressure</label>
                  <input
                    type="text"
                    name="vitalSigns.bloodPressure"
                    id="vitalSigns.bloodPressure"
                    value={formData.vitalSigns.bloodPressure}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="vitalSigns.heartRate" className="block text-sm font-medium text-gray-700">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    name="vitalSigns.heartRate"
                    id="vitalSigns.heartRate"
                    value={formData.vitalSigns.heartRate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="vitalSigns.oxygenSaturation" className="block text-sm font-medium text-gray-700">O2 Saturation (%)</label>
                  <input
                    type="number"
                    name="vitalSigns.oxygenSaturation"
                    id="vitalSigns.oxygenSaturation"
                    value={formData.vitalSigns.oxygenSaturation}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="nihssScore" className="block text-sm font-medium text-gray-700">NIHSS Score</label>
                  <input
                    type="number"
                    name="nihssScore"
                    id="nihssScore"
                    value={formData.nihssScore}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Imaging Results */}
        <Card>
          <CardHeader className="bg-gray-50 border-b">
            <div className="flex items-center">
              <BrainCircuit className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Imaging Results</h3>
            </div>
          </CardHeader>
          <CardContent>
            {!isEditing ? (
              <div>
                {patient.imagingResults.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {patient.imagingResults.map((result: string, index: number) => (
                      <li key={index} className="py-3">
                        <span className="text-sm text-gray-900">
                          {result}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No imaging results available.</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <label htmlFor="imagingResults" className="block text-sm font-medium text-gray-700">Imaging Results</label>
                <div className="space-y-2">
                  {formData.imagingResults?.map((result: string, index: number) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="text"
                        name={`imagingResults[${index}]`}
                        value={result}
                        onChange={(e) => {
                          const updatedResults = [...formData.imagingResults];
                          updatedResults[index] = e.target.value;
                          setFormData({...formData, imagingResults: updatedResults});
                        }}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updatedResults = formData.imagingResults.filter((_: any, i: number) => i !== index);
                          setFormData({...formData, imagingResults: updatedResults});
                        }}
                        className="ml-2 p-2 text-gray-400 hover:text-gray-500"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const updatedResults = [...formData.imagingResults, ''];
                      setFormData({...formData, imagingResults: updatedResults});
                    }}
                  >
                    Add Result
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Treatment Notes */}
      <Card>
        <CardHeader className="bg-gray-50 border-b">
          <div className="flex items-center">
            <ListChecks className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Treatment Notes</h3>
          </div>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-line">{patient.notes || 'No treatment notes available.'}</p>
            </div>
          ) : (
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                name="notes"
                id="notes"
                rows={5}
                value={formData.notes}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          )}
        </CardContent>
        {isTPaPending && role === 'neurologist' && (
          <CardFooter className="bg-gray-50">
            <Alert variant="warning" title="Treatment Decision Required">
              <p>This patient is awaiting a tPA treatment decision. Please review the clinical data and imaging results before making a decision.</p>
            </Alert>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default PatientDetail;