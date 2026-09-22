import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const initialForm = { username: '', password: '' };

export default function Login({ onSwitchToSignup }) {
  const [formData, setFormData] = useState(initialForm);
  const [message, setMessage] = useState('');
  const { login, loading } = useAuth();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      await login(formData.username, formData.password);
      setMessage('Signed in successfully. Loading your dashboard...');
      setFormData(initialForm);
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
          <h1>Welcome back.</h1>
          <p>Sign in to access your private financial workspace and continue where you left off.</p>
          <ul>
            <li>Your dashboard is private to your account</li>
            <li>Your financial records stay separated by user</li>
            <li>Your password is protected on the server</li>
          </ul>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-header">
            <h2>Sign in</h2>
            <p>Use your WELLTH username and password.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label htmlFor="login-username">Username</label>
              <input id="login-username" name="username" className="auth-input" type="text" placeholder="alex-carter" value={formData.username} onChange={handleChange} autoComplete="username" required />
            </div>
            <div className="field-group">
              <label htmlFor="login-password">Password</label>
              <input id="login-password" name="password" className="auth-input" type="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} autoComplete="current-password" required />
            </div>
            <button className="auth-button" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
          </form>
          <button className="auth-switch" type="button" onClick={onSwitchToSignup}>Need an account? Create one</button>
          {message && <div className={`auth-message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</div>}
        </div>
      </div>
    </div>
  );
}
