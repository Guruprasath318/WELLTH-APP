import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const initialForm = { username: '', password: '', confirmPassword: '' };

export default function CreateAccount({ onSwitchToLogin }) {
  const [formData, setFormData] = useState(initialForm);
  const [message, setMessage] = useState('');
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setMessage('Error: Passwords do not match');
      return;
    }

    try {
      await signup(formData.username, formData.password, formData.confirmPassword);
      setMessage('Account created successfully. Redirecting...');
      setFormData(initialForm);
      setTimeout(() => navigate('/'), 700);
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
            <img src="/Wellth.jpg" alt="WELLTH logo" className="auth-logo" />
            <div className="auth-badge">WELLTH</div>
          </div>
          <h1>Your money, your space.</h1>
          <p>Create a private WELLTH account and keep your financial workspace separated from everyone else&apos;s.</p>
          <ul>
            <li>One account for your personal dashboard</li>
            <li>Your data is stored against your account</li>
            <li>Your password is securely hashed on the server</li>
          </ul>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-header">
            <h2>Create your account</h2>
            <p>Choose a username and password to get started.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label htmlFor="username">Username</label>
              <input id="username" name="username" className="auth-input" type="text" placeholder="alex-carter" value={formData.username} onChange={handleChange} autoComplete="username" minLength={3} maxLength={32} required />
            </div>
            <div className="field-group">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" className="auth-input" type="password" placeholder="At least 6 characters" value={formData.password} onChange={handleChange} autoComplete="new-password" minLength={6} required />
            </div>
            <div className="field-group">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input id="confirmPassword" name="confirmPassword" className="auth-input" type="password" placeholder="Enter your password again" value={formData.confirmPassword} onChange={handleChange} autoComplete="new-password" required />
            </div>
            <button className="auth-button" type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</button>
          </form>
          <button className="auth-switch" type="button" onClick={onSwitchToLogin}>Already have an account? Sign in</button>
          {message && <div className={`auth-message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</div>}
        </div>
      </div>
    </div>
  );
}