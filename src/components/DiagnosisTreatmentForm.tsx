import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from './ui/Card';
import Button from './ui/Button';
import Alert from './ui/Alert';

interface DiagnosisTreatmentFormProps {
  onSubmit: (diagnosis: string, treatment: string, tpaEligible: boolean) => void;
  onClose: () => void;
}

const DiagnosisTreatmentForm: React.FC<DiagnosisTreatmentFormProps> = ({ onSubmit, onClose }) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [tpaEligible, setTpaEligible] = useState<boolean | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!diagnosis || !treatment || tpaEligible === null) {
      setError('Please complete all fields');
      return;
    }
    
    onSubmit(diagnosis, treatment, tpaEligible);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Diagnosis & Treatment Plan</h3>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="error" className="mb-4">{error}</Alert>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Diagnosis
              </label>
              <select
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="">Select diagnosis</option>
                <option value="Acute ischemic stroke">Acute ischemic stroke</option>
                <option value="Hemorrhagic stroke">Hemorrhagic stroke</option>
                <option value="Transient ischemic attack">Transient ischemic attack</option>
                <option value="Stroke mimic">Stroke mimic</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Treatment Plan
              </label>
              <textarea
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Enter treatment plan details"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                tPA Eligibility Assessment
              </label>
              <div className="mt-2 space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="tpaEligible"
                    checked={tpaEligible === true}
                    onChange={() => setTpaEligible(true)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-900">Eligible for tPA</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="tpaEligible"
                    checked={tpaEligible === false}
                    onChange={() => setTpaEligible(false)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-900">Not eligible for tPA</span>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Submit
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default DiagnosisTreatmentForm;