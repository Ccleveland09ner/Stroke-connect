import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from './ui/Card';
import Button from './ui/Button';
import Alert from './ui/Alert';

interface AddPatientFormProps {
  onSubmit: (patientData: {
    name: string;
    age: number;
    gender: string;
    medicalRecordNumber: string;
    chiefComplaint: string;
  }) => void;
  onClose: () => void;
}

const AddPatientForm: React.FC<AddPatientFormProps> = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    medicalRecordNumber: '',
    chiefComplaint: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.age || !formData.medicalRecordNumber) {
      setError('Please fill in all required fields');
      return;
    }

    onSubmit({
      ...formData,
      age: parseInt(formData.age)
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Add New Patient</h3>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="error" className="mb-4">{error}</Alert>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Patient Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Age *
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Medical Record Number *
              </label>
              <input
                type="text"
                name="medicalRecordNumber"
                value={formData.medicalRecordNumber}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Chief Complaint
              </label>
              <textarea
                name="chiefComplaint"
                value={formData.chiefComplaint}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Add Patient
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AddPatientForm;