import { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { FaCreditCard } from 'react-icons/fa6';
import { formatCurrency } from '../utils/storage';

export function Accounts() {
  const { data, loading, addAccount } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Bank Account',
    balance: '',
    accountNumber: ''
  });

  if (loading || !data) {
    return <><h1 className="page-title"><FaCreditCard style={{ display: 'inline', marginRight: '8px' }} /> Accounts</h1><p>Loading...</p></>;
  }

  const accountTypes = ['Bank Account', 'Credit Card', 'Digital Wallet', 'Investment Account', 'Savings Account'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'balance' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.balance !== '') {
      addAccount(formData);
      setFormData({
        name: '',
        type: 'Bank Account',
        balance: '',
        accountNumber: ''
      });
      setShowForm(false);
    }
  };

  const totalBalance = data.accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 className="page-title"><FaCreditCard style={{ display: 'inline', marginRight: '8px' }} /> Accounts</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          + Add Account
        </button>
      </div>

      <div className="dashboard-cards" style={{ marginBottom: '30px' }}>
        <div className="card">
          <div className="card-title">Total Balance</div>
          <div className="card-value">{formatCurrency(totalBalance)}</div>
          <div className="card-subtitle">{data.accounts.length} accounts</div>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '30px', backgroundColor: '#f8fafc' }}>
          <h2 style={{ marginBottom: '20px' }}>Add Bank Account</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Account Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Main Checking"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label htmlFor="type">Account Type</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  {accountTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="balance">Balance</label>
                <input
                  id="balance"
                  type="number"
                  name="balance"
                  step="0.01"
                  value={formData.balance}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="accountNumber">Account Number (Optional)</label>
              <input
                id="accountNumber"
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                placeholder="Last 4 digits"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-success">Save Account</button>
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
        <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Your Accounts</h2>
        {data.accounts.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Account Name</th>
                <th>Type</th>
                <th>Balance</th>
                <th>Account Number</th>
              </tr>
            </thead>
            <tbody>
              {data.accounts.map(account => (
                <tr key={account.id}>
                  <td>{account.name}</td>
                  <td>{account.type}</td>
                  <td>{formatCurrency(account.balance)}</td>
                  <td>{account.accountNumber || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No accounts added yet. Add your bank accounts to track your balance!</p>
        )}
      </div>
    </>
  );
}
