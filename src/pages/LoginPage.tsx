import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Activity, User, HeartPulse, Stethoscope, UserPlus } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';

interface LocationState {
  from?: { pathname: string };
}

const LoginPage: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'neurologist' | 'technician' | 'patient' | ''>('');
  const [medications, setMedications] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const from = state?.from?.pathname || '/dashboard';

  const { login, register } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !password) {
      setError('Please enter both name and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (isRegistering) {
        if (!email || !role) {
          setError('Please fill in all required fields');
          return;
        }

        const success = await register({
          name,
          email,
          password,
          role,
          medications: role === 'patient' ? medications : undefined,
          medicalHistory: role === 'patient' ? medicalHistory : undefined,
        });

        if (success) {
          navigate(from, { replace: true });
        } else {
          if (role === 'patient') {
            setError('Registration failed. Please verify your name matches your medical records.');
          } else {
            setError('Registration failed. This name may already be registered.');
          }
        }
      } else {
        const success = await login(name, password);
        if (success) {
          navigate(from, { replace: true });
        } else {
          setError('Invalid credentials. Please try again.');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Activity className="h-12 w-12 text-primary-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          StrokeConnect
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Medical Stroke Management Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {isRegistering ? 'Create Account' : 'Sign In'}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError('');
                }}
              >
                {isRegistering ? (
                  'Back to Sign In'
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Register
                  </>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="error" className="mb-4">{error}</Alert>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder={isRegistering ? "Enter your full name" : "Enter your name to sign in"}
                />
              </div>
            </div>

            {isRegistering && (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <div className="mt-1">
                    <select
                      id="role"
                      name="role"
                      required
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    >
                      <option value="">Select a role</option>
                      <option value="patient">Patient</option>
                      <option value="neurologist">Neurologist</option>
                      <option value="technician">Technician</option>
                    </select>
                  </div>
                </div>

                {role === 'patient' && (
                  <>
                    <div>
                      <label htmlFor="medications" className="block text-sm font-medium text-gray-700">
                        Current Medications
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="medications"
                          name="medications"
                          rows={3}
                          value={medications}
                          onChange={(e) => setMedications(e.target.value)}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          placeholder="List any medications you are currently taking"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700">
                        Medical History
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="medicalHistory"
                          name="medicalHistory"
                          rows={3}
                          value={medicalHistory}
                          onChange={(e) => setMedicalHistory(e.target.value)}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          placeholder="Brief description of your medical history"
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                {isLoading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Sign in')}
              </Button>
            </div>
          </form>

          {!isRegistering && (
            <div className="mt-6">
              <div className="text-center text-xs text-gray-500">
                <p>For demo, use these names:</p>
                <p className="mt-1">Dr. Sarah Johnson (Neurologist)</p>
                <p>Alex Rodriguez (Technician)</p>
                <p>Jamie Smith (Patient)</p>
                <p className="mt-1">Password: password</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;