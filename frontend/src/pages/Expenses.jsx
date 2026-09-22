import { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { FaArrowDown } from 'react-icons/fa6';
import { formatCurrency } from '../utils/storage';

export function Expenses() {
  const { data, loading, addExpense, deleteExpense } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0]
  });

  if (loading || !data) {
    return <><h1 className="page-title"><FaArrowDown style={{ display: 'inline', marginRight: '8px' }} /> Expenses</h1><p>Loading...</p></>;
  }

  const categories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Healthcare', 'Shopping', 'Other'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.description && formData.amount) {
      addExpense(formData);
      setFormData({
        description: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0]
      });
      setShowForm(false);
    }
  };

  const totalExpenses = data.expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 className="page-title"><FaArrowDown style={{ display: 'inline', marginRight: '8px' }} /> Expenses</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          + Add Expense
        </button>
      </div>

      <div className="dashboard-cards" style={{ marginBottom: '30px' }}>
        <div className="card">
          <div className="card-title">Total Expenses</div>
          <div className="card-value">{formatCurrency(totalExpenses)}</div>
          <div className="card-subtitle">{data.expenses.length} expenses</div>
        </div>
        <div className="card">
          <div className="card-title">Average Expense</div>
          <div className="card-value">
            {formatCurrency(data.expenses.length > 0 ? totalExpenses / data.expenses.length : 0)}
          </div>
          <div className="card-subtitle">Per expense</div>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '30px', backgroundColor: '#f8fafc' }}>
          <h2 style={{ marginBottom: '20px' }}>Add New Expense</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                id="description"
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label htmlFor="amount">Amount</label>
                <input
                  id="amount"
                  type="number"
                  name="amount"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-success">Save Expense</button>
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
        <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>All Expenses</h2>
        {data.expenses.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.expenses.map(expense => (
                <tr key={expense.id}>
                  <td>{expense.description}</td>
                  <td>{formatCurrency(expense.amount)}</td>
                  <td>{expense.category}</td>
                  <td>{new Date(expense.date).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteExpense(expense.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No expenses yet. Add one to get started!</p>
        )}
      </div>
    </>
  );
}
