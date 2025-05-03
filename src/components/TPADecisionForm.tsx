import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from './ui/Card';
import Button from './ui/Button';
import Alert from './ui/Alert';

interface TPADecisionFormProps {
  onSubmit: (decision: 'approved' | 'denied', reason: string) => void;
  onClose: () => void;
}

const TPADecisionForm: React.FC<TPADecisionFormProps> = ({ onSubmit, onClose }) => {
  const [decision, setDecision] = useState<'approved' | 'denied' | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!decision || !reason) {
      setError('Please complete all fields');
      return;
    }
    
    onSubmit(decision, reason);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">tPA Treatment Decision</h3>
          <p className="text-sm text-gray-500">
            Please review all clinical data before making your decision
          </p>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="error" className="mb-4">{error}</Alert>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Decision
              </label>
              <div className="mt-2 space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="decision"
                    checked={decision === 'approved'}
                    onChange={() => setDecision('approved')}
                    className="h-4 w-4 text-success-600 focus:ring-success-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-900">Approve tPA</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="decision"
                    checked={decision === 'denied'}
                    onChange={() => setDecision('denied')}
                    className="h-4 w-4 text-error-600 focus:ring-error-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-900">Deny tPA</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Reason for Decision
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Provide detailed reasoning for your decision"
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit"
            variant={decision === 'approved' ? 'success' : 'error'}
          >
            {decision === 'approved' ? 'Approve tPA' : 'Deny tPA'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TPADecisionForm;