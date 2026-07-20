import { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { FaTrash, FaPenToSquare } from 'react-icons/fa6';
import { formatCurrency } from '../utils/storage';

export function Income() {
  const { data, loading, addIncome, deleteIncome, updateIncome } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterFrequency, setFilterFrequency] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    frequency: 'Monthly',
    date: new Date().toISOString().split('T')[0]
  });

  if (loading || !data) {
    return <><h1 className="page-title">Income</h1><p>Loading...</p></>;
  }

  const frequencies = ['One-time', 'Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', 'Yearly'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.source || !formData.amount) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (formData.amount <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    if (editingId) {
      updateIncome(editingId, formData);
      setEditingId(null);
    } else {
      addIncome(formData);
    }
    
    setFormData({
      source: '',
      amount: '',
      frequency: 'Monthly',
      date: new Date().toISOString().split('T')[0]
    });
    setShowForm(false);
  };

  const handleEdit = (income) => {
    setEditingId(income.id);
    setFormData(income);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      source: '',
      amount: '',
      frequency: 'Monthly',
      date: new Date().toISOString().split('T')[0]
    });
    setShowForm(false);
  };

  // Calculate recurring income multipliers
  const frequencyMultipliers = {
    'One-time': 0,
    'Weekly': 52,
    'Bi-weekly': 26,
    'Monthly': 12,
    'Quarterly': 4,
    'Yearly': 1
  };

  const totalIncome = data.incomes.reduce((sum, income) => sum + income.amount, 0);
  
  // Calculate annual recurring income
  const annualIncome = data.incomes.reduce((sum, income) => {
    return sum + (income.amount * frequencyMultipliers[income.frequency]);
  }, 0);

  // Calculate monthly recurring income
  const monthlyIncome = data.incomes.reduce((sum, income) => {
    const multiplier = frequencyMultipliers[income.frequency];
    return sum + (multiplier > 0 ? (income.amount * multiplier) / 12 : 0);
  }, 0);

  // Filter and sort incomes
  let filteredIncomes = data.incomes;
  if (filterFrequency !== 'All') {
    filteredIncomes = filteredIncomes.filter(i => i.frequency === filterFrequency);
  }

  if (sortBy === 'amount-high') {
    filteredIncomes = [...filteredIncomes].sort((a, b) => b.amount - a.amount);
  } else if (sortBy === 'amount-low') {
    filteredIncomes = [...filteredIncomes].sort((a, b) => a.amount - b.amount);
  } else if (sortBy === 'source') {
    filteredIncomes = [...filteredIncomes].sort((a, b) => a.source.localeCompare(b.source));
  } else {
    filteredIncomes = [...filteredIncomes].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // Get income breakdown by frequency
  const incomeByFrequency = frequencies.reduce((acc, freq) => {
    const total = data.incomes
      .filter(i => i.frequency === freq)
      .reduce((sum, i) => sum + i.amount, 0);
    if (total > 0) {
      acc[freq] = total;
    }
    return acc;
  }, {});
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 className="page-title"><span style={{ display: 'inline', marginRight: '8px', fontSize: '36px' }}>₹</span> Income</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setEditingId(null);
            setShowForm(!showForm);
          }}
        >
          + Add Income
        </button>
      </div>

      {/* Income Statistics Cards */}
      <div className="dashboard-cards" style={{ marginBottom: '30px' }}>
        <div className="card">
          <div className="card-title">Total Income Sources</div>
          <div className="card-value" style={{ color: '#27ae60' }}>{formatCurrency(totalIncome)}</div>
          <div className="card-subtitle">{data.incomes.length} sources</div>
        </div>
        <div className="card">
          <div className="card-title">Monthly Income</div>
          <div className="card-value" style={{ color: '#3498db' }}>{formatCurrency(monthlyIncome)}</div>
          <div className="card-subtitle">Recurring only</div>
        </div>
        <div className="card">
          <div className="card-title">Annual Income</div>
          <div className="card-value" style={{ color: '#2ecc71' }}>{formatCurrency(annualIncome)}</div>
          <div className="card-subtitle">From recurring</div>
        </div>
      </div>

      {/* Income Breakdown by Frequency */}
      {Object.keys(incomeByFrequency).length > 0 && (
        <div className="card" style={{ marginBottom: '30px', backgroundColor: '#f8fafc' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: '600' }}>Income Breakdown by Frequency</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
            {Object.entries(incomeByFrequency).map(([freq, amount]) => (
              <div key={freq} style={{ padding: '15px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>{freq}</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#27ae60' }}>{formatCurrency(amount)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: '30px', backgroundColor: '#f8fafc' }}>
          <h2 style={{ marginBottom: '20px' }}>{editingId ? 'Edit Income Source' : 'Add Income Source'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="source">Source *</label>
              <input
                id="source"
                type="text"
                name="source"
                value={formData.source}
                onChange={handleInputChange}
                placeholder="e.g., Salary, Freelance, Investment"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label htmlFor="amount">Amount (₹) *</label>
                <input
                  id="amount"
                  type="number"
                  name="amount"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="frequency">Frequency</label>
                <select
                  id="frequency"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                >
                  {frequencies.map(freq => (
                    <option key={freq} value={freq}>{freq}</option>
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
              <button type="submit" className="btn btn-success">
                {editingId ? 'Update Income' : 'Save Income'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtering and Sorting */}
      <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
        <div className="form-group">
          <label htmlFor="filter">Filter by Frequency</label>
          <select 
            id="filter"
            value={filterFrequency} 
            onChange={(e) => setFilterFrequency(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="All">All Frequencies</option>
            {frequencies.map(freq => (
              <option key={freq} value={freq}>{freq}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="sort">Sort by</label>
          <select 
            id="sort"
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="date">Recent First</option>
            <option value="amount-high">Amount (High to Low)</option>
            <option value="amount-low">Amount (Low to High)</option>
            <option value="source">Source (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Income Sources Table */}
      <div>
        <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Income Sources</h2>
        {filteredIncomes.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Amount</th>
                <th>Frequency</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncomes.map(income => (
                <tr key={income.id}>
                  <td><strong>{income.source}</strong></td>
                  <td>{formatCurrency(income.amount)}</td>
                  <td><span style={{ padding: '4px 8px', backgroundColor: '#e8f5e9', borderRadius: '4px', fontSize: '12px' }}>{income.frequency}</span></td>
                  <td>{new Date(income.date).toLocaleDateString()}</td>
                  <td style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEdit(income)}
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <FaPenToSquare size={14} /> Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this income source?')) {
                          deleteIncome(income.id);
                        }
                      }}
                      className="btn btn-danger"
                      style={{ padding: '4px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <FaTrash size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            <p style={{ fontSize: '16px', color: '#666' }}>No income sources {filterFrequency !== 'All' ? `with frequency "${filterFrequency}"` : ''}. Add your income sources!</p>
          </div>
        )}
      </div>
    </>
  );
}
