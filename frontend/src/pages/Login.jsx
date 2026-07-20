import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const initialForm = {
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [message, setMessage] = useState('');

  const { login, signup, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (isSignup && formData.password !== formData.confirmPassword) {
      setMessage('Error: Passwords do not match');
      return;
    }

    try {
      if (isSignup) {
        await signup(formData.displayName, formData.email, formData.password, formData.confirmPassword);
        setMessage('Account created successfully! Redirecting...');
      } else {
        await login(formData.email, formData.password);
        setMessage('Login successful! Redirecting...');
      }

      setFormData(initialForm);
      setTimeout(() => navigate('/'), 900);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-orb orb-one" />
      <div className="auth-orb orb-two" />

      <div className="auth-card">
        <div className="auth-hero">
          <div className="auth-brand-row">
            <img src="/Wellth.jpg" alt="WELLTH Logo" className="auth-logo" />
            <div className="auth-badge">WELLTH</div>
          </div>
          <h1>{isSignup ? 'Create your account' : 'Welcome back'}</h1>
          <p>Secure personal finance tracking with a polished experience built for everyday confidence.</p>
          <ul>
            <li>• Save account details securely for future sign-ins</li>
            <li>• Track expenses, income, and goals in one place</li>
            <li>• Enjoy a refined, 3D-inspired dashboard experience</li>
          </ul>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-header">
            <h2>{isSignup ? 'Sign up' : 'Sign in'}</h2>
            <p>{isSignup ? 'Start your smarter finance journey.' : 'Use your email and password to continue.'}</p>
          </div>

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <div className="field-group">
                <label htmlFor="displayName">Full name</label>
                <input
                  id="displayName"
                  name="displayName"
                  className="auth-input"
                  type="text"
                  placeholder="Alex Carter"
                  value={formData.displayName}
                  onChange={handleChange}
                  required={isSignup}
                />
              </div>
            )}

            <div className="field-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                className="auth-input"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                className="auth-input"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {isSignup && (
              <div className="field-group">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  className="auth-input"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required={isSignup}
                />
              </div>
            )}

            <button className="auth-button" type="submit" disabled={loading}>
              {loading ? 'Please wait...' : isSignup ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <button className="auth-switch" type="button" onClick={() => setIsSignup((prev) => !prev)}>
            {isSignup ? 'Already have an account? Sign in' : 'Need an account? Create one'}
          </button>

          {message && <div className={`auth-message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</div>}
        </div>
      </div>
    </div>
  );
}