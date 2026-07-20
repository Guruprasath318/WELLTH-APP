import { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { FaBullseye } from 'react-icons/fa6';
import { formatCurrency } from '../utils/storage';

export function Budget() {
  const { data, loading, addBudget } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    period: 'Monthly'
  });

  if (loading || !data) {
    return <><h1 className="page-title">Budget</h1><p>Loading...</p></>;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'limit' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.category && formData.limit) {
      addBudget(formData);
      setFormData({
        category: '',
        limit: '',
        period: 'Monthly'
      });
      setShowForm(false);
    }
  };

  const budgetCategories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Healthcare', 'Shopping'];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 className="page-title"><FaBullseye style={{ display: 'inline', marginRight: '8px' }} /> Budget</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          + Set Budget
        </button>
      </div>

      <div className="dashboard-cards" style={{ marginBottom: '30px' }}>
        <div className="card">
          <div className="card-title">Active Budgets</div>
          <div className="card-value">{data.budgets.length}</div>
          <div className="card-subtitle">Budget limits set</div>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '30px', backgroundColor: '#f8fafc' }}>
          <h2 style={{ marginBottom: '20px' }}>Set Budget Limit</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  {budgetCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="limit">Monthly Limit</label>
                <input
                  id="limit"
                  type="number"
                  name="limit"
                  step="0.01"
                  value={formData.limit}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-success">Save Budget</button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div>
        <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Your Budgets</h2>
        {data.budgets.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Limit</th>
                <th>Period</th>
              </tr>
            </thead>
            <tbody>
              {data.budgets.map(budget => (
                <tr key={budget.id}>
                  <td>{budget.category}</td>
                  <td>{formatCurrency(budget.limit)}</td>
                  <td>{budget.period}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No budgets set yet. Create one to manage your spending!</p>
        )}
      </div>
    </>
  );
}
