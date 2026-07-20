import { useState, useEffect } from 'react';
import { useFinance } from '../hooks/useFinance';
import { useDarkMode } from '../hooks/useDarkMode';
import { FaGear, FaMoon, FaSun } from 'react-icons/fa6';

export function Settings() {
  const { data, loading, updateProfile } = useFinance();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [formData, setFormData] = useState({
    age: 0,
    total_income: 0,
    total_expenses: 0,
    total_savings: 0
  });

  useEffect(() => {
    if (data?.profile) {
      setFormData({
        age: data.profile.age || 0,
        total_income: data.profile.total_income || data.profile.income || 0,
        total_expenses: data.profile.total_expenses || data.profile.expenses || 0,
        total_savings: data.profile.total_savings || data.profile.savings || 0
      });
    }
  }, [data]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) : parseFloat(value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Map frontend field names to backend field names
    updateProfile({
      age: formData.age,
      total_income: formData.total_income,
      total_expenses: formData.total_expenses,
      total_savings: formData.total_savings
    });
    alert('Profile updated successfully!');
  };

  if (loading || !data) {
    return <><h1 className="page-title">Settings</h1><p>Loading...</p></>;
  }

  return (
    <>
      <h1 className="page-title"><FaGear style={{ display: 'inline', marginRight: '8px' }} /> Settings</h1>

      <div className="card" style={{ maxWidth: '600px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Profile Settings</h2>
        <form onSubmit={handleSubmit}>
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
            <label htmlFor="total_income">Annual Income</label>
            <input
              id="total_income"
              type="number"
              name="total_income"
              step="0.01"
              value={formData.total_income}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="total_expenses">Annual Expenses</label>
            <input
              id="total_expenses"
              type="number"
              name="total_expenses"
              step="0.01"
              value={formData.total_expenses}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="total_savings">Annual Savings Goal</label>
            <input
              id="total_savings"
              type="number"
              name="total_savings"
              step="0.01"
              value={formData.total_savings}
              onChange={handleInputChange}
            />
          </div>

          <button type="submit" className="btn btn-success">
            Save Settings
          </button>
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
