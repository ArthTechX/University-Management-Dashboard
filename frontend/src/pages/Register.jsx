import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchWithAuth } from '../api/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await fetchWithAuth('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-academic-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <span className="font-serif font-bold text-4xl tracking-tight text-academic-primary mb-4 block">
          <span className="text-academic-heading mr-1">Edu</span>Track
        </span>
        <h2 className="text-2xl font-bold text-academic-heading tracking-tight border-none mb-1">
          Student Registration
        </h2>
        <p className="text-sm text-academic-muted">
          Create your academic account
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-academic-surface border border-academic-border p-8 rounded-sm">
          {success ? (
            <div className="bg-green-50 border-l-4 border-academic-success p-4">
              <p className="text-sm text-academic-success">
                Registration successful! Redirecting to login...
              </p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border-l-4 border-academic-error p-4 mb-4">
                  <p className="text-sm text-academic-error">{error}</p>
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Full name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-academic-muted">
                    Must be at least 8 characters, containing letters and numbers.
                  </p>
                </div>
              </div>

              <div>
                <button type="submit" className="w-full btn btn-primary py-2 px-4">
                  Register
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-academic-muted">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-academic-primary hover:text-academic-primary-light">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
