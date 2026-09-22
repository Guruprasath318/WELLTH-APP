import { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { FaWallet } from 'react-icons/fa6';
import { formatCurrency } from '../utils/storage';

export function Assets() {
  const { data, loading, addAsset, deleteAsset } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    type: 'Bank Account',
    description: ''
  });

  if (loading || !data) {
    return <><h1 className="page-title"><FaWallet style={{ display: 'inline', marginRight: '8px' }} /> Wealth</h1><p>Loading...</p></>;
  }

  const assetTypes = ['Bank Account', 'Savings', 'Investment', 'Property', 'Vehicle', 'Cryptocurrency', 'Other'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'value' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.value) {
      addAsset(formData);
      setFormData({
        name: '',
        value: '',
        type: 'Bank Account',
        description: ''
      });
      setShowForm(false);
    }
  };

  const totalAssets = data.assets.reduce((sum, asset) => sum + asset.value, 0);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 className="page-title"><FaWallet style={{ display: 'inline', marginRight: '8px' }} /> Wealth</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          + Add Asset
        </button>
      </div>

      <div className="dashboard-cards" style={{ marginBottom: '30px' }}>
        <div className="card">
          <div className="card-title">Total Assets</div>
          <div className="card-value">{formatCurrency(totalAssets)}</div>
          <div className="card-subtitle">{data.assets.length} assets</div>
        </div>
        <div className="card">
          <div className="card-title">Average Asset Value</div>
          <div className="card-value">
            {formatCurrency(data.assets.length > 0 ? totalAssets / data.assets.length : 0)}
          </div>
          <div className="card-subtitle">Per asset</div>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '30px', backgroundColor: '#f8fafc' }}>
          <h2 style={{ marginBottom: '20px' }}>Add New Asset</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Asset Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Savings Account"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label htmlFor="value">Value</label>
                <input
                  id="value"
                  type="number"
                  name="value"
                  step="0.01"
                  value={formData.value}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">Type</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  {assetTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-success">Save Asset</button>
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
        <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>All Assets</h2>
        {data.assets.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Value</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.assets.map(asset => (
                <tr key={asset.id}>
                  <td>{asset.name}</td>
                  <td>{asset.type}</td>
                  <td>{formatCurrency(asset.value)}</td>
                  <td>{asset.description}</td>
                  <td>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteAsset(asset.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No assets yet. Start tracking your assets!</p>
        )}
      </div>
    </>
  );
}
