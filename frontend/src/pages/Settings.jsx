import { useState, useEffect } from 'react';
import { useFinance } from '../hooks/useFinance';
import { useAuth } from '../hooks/useAuth';
import { useDarkMode } from '../hooks/useDarkMode';
import { FaGear, FaMoon, FaSun } from 'react-icons/fa6';

export function Settings() {
  const { data, loading, updateProfile } = useFinance();
  const { user, updateUser, changePassword } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [formData, setFormData] = useState({
    username: '',
    age: 0,
    date_of_birth: ''
  });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (data?.profile) {
      setFormData({
        username: user?.username || '',
        age: data.profile.age || 0,
        date_of_birth: data.profile.date_of_birth || ''
      });
    }
  }, [data, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'age' ? parseInt(value, 10) || 0 : value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile({
      username: formData.username,
      age: formData.age,
      date_of_birth: formData.date_of_birth || null
    });
    updateUser({ username: formData.username });
    alert('Profile updated successfully!');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword, passwordData.confirmPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password changed successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading || !data) {
    return <><h1 className="page-title"><FaGear style={{ display: 'inline', marginRight: '8px' }} /> Settings</h1><p>Loading...</p></>;
  }

  return (
    <>
      <h1 className="page-title"><FaGear style={{ display: 'inline', marginRight: '8px' }} /> Settings</h1>

      <div className="card" style={{ maxWidth: '600px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Profile Settings</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input id="username" type="text" name="username" value={formData.username} onChange={handleInputChange} minLength="3" maxLength="32" required />
          </div>

          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input
              id="age"
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="date_of_birth">Date of birth</label>
            <input id="date_of_birth" type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} />
          </div>

          <button type="submit" className="btn btn-success">
            Save Settings
          </button>
        </form>
      </div>

      <div className="card" style={{ maxWidth: '600px', marginTop: '30px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Change Password</h2>
        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label htmlFor="currentPassword">Current password</label>
            <input id="currentPassword" type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} autoComplete="current-password" required />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">New password</label>
            <input id="newPassword" type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} autoComplete="new-password" minLength="6" required />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm new password</label>
            <input id="confirmPassword" type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} autoComplete="new-password" minLength="6" required />
          </div>
          <button type="submit" className="btn btn-success">Change Password</button>
        </form>
      </div>

      <div className="card" style={{ maxWidth: '600px', marginTop: '30px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Appearance</h2>
        <div className="settings-row">
          <div className="settings-row-info">
            <strong>Dark Mode</strong>
            <p>Toggle dark mode for the entire application</p>
          </div>
          <button
            className={`dark-mode-toggle-btn ${darkMode ? 'active' : ''}`}
            onClick={toggleDarkMode}
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '600px', marginTop: '30px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>About WELLTH APP</h2>
        <p>
          <strong>WELLTH APP</strong> is an advanced personal finance management application built with React and modern web technologies.
          It helps you track your income, expenses, assets, and manage your financial goals efficiently with powerful insights and analytics.
        </p>
        <p style={{ marginTop: '15px', color: '#7f8c8d' }}>
          <strong>WELLTH</strong> • Version: 1.0.0 | Powered by GP | Last Updated: May 2026
        </p>
      </div>
    </>
  );
}
