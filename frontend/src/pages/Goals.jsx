import { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { FaBullseye, FaPlus, FaTrash, FaLink, FaCircleCheck } from 'react-icons/fa6';
import { formatCurrency } from '../utils/storage';

export function Goals() {
  const { data, loading, addGoal, deleteGoal, updateGoal } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    initialSavings: '',
    linkedAssetId: 'manual' // 'manual' or the ID of an asset
  });

  if (loading || !data) {
    return <><h1 className="page-title"><FaBullseye style={{ display: 'inline', marginRight: '8px' }} /> Goals</h1><p>Loading...</p></>;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'targetAmount' || name === 'initialSavings' ? parseFloat(value) || '' : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.targetAmount || !formData.targetDate) {
      alert('Please fill in all required fields');
      return;
    }

    addGoal({
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      targetDate: formData.targetDate,
      initialSavings: parseFloat(formData.initialSavings || 0),
      linkedAssetId: formData.linkedAssetId === 'manual' ? null : parseInt(formData.linkedAssetId)
    });

    setFormData({
      name: '',
      targetAmount: '',
      targetDate: '',
      initialSavings: '',
      linkedAssetId: 'manual'
    });
    setShowForm(false);
  };

  // Helper to calculate progress for a goal
  const calculateGoalProgress = (goal) => {
    let saved = goal.initialSavings || 0;
    let linkedAsset = null;

    if (goal.linkedAssetId) {
      linkedAsset = data.assets.find(a => a.id === goal.linkedAssetId);
      if (linkedAsset) {
        saved = linkedAsset.value;
      }
    }

    const percent = Math.min(100, (saved / goal.targetAmount) * 100);
    return {
      saved,
      percent,
      linkedAssetName: linkedAsset ? linkedAsset.name : null
    };
  };

  // Helper to get remaining months
  const getMonthsRemaining = (targetDateString) => {
    const targetDate = new Date(targetDateString);
    const currentDate = new Date();
    const diffTime = targetDate - currentDate;
    if (diffTime <= 0) return 'Target Date Reached';

    const diffYears = targetDate.getFullYear() - currentDate.getFullYear();
    const diffMonths = targetDate.getMonth() - currentDate.getMonth();
    const totalMonths = (diffYears * 12) + diffMonths;

    if (totalMonths <= 0) return 'Less than a month';
    if (totalMonths === 1) return '1 month';
    return `${totalMonths} months`;
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 className="page-title"><FaBullseye style={{ display: 'inline', marginRight: '8px' }} /> Goals</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          + Add New Goal
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '30px', backgroundColor: '#f8fafc' }}>
          <h2 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>Create a Financial Goal</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Goal Name *</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., House Down Payment, Retirement Fund"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label htmlFor="targetAmount">Target Amount (₹) *</label>
                <input
                  id="targetAmount"
                  type="number"
                  name="targetAmount"
                  min="0"
                  step="1"
                  value={formData.targetAmount}
                  onChange={handleInputChange}
                  placeholder="e.g., 50000"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="targetDate">Target Date *</label>
                <input
                  id="targetDate"
                  type="month"
                  name="targetDate"
                  value={formData.targetDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="linkedAssetId">Link to Asset (Auto-update Balance)</label>
              <select
                id="linkedAssetId"
                name="linkedAssetId"
                value={formData.linkedAssetId}
                onChange={handleInputChange}
                style={{ width: '100%' }}
              >
                <option value="manual">Manual Savings Amount (No Link)</option>
                {data.assets.map(asset => (
                  <option key={asset.id} value={asset.id}>
                    Link to: {asset.name} ({formatCurrency(asset.value)})
                  </option>
                ))}
              </select>
            </div>

            {formData.linkedAssetId === 'manual' && (
              <div className="form-group animate-fade">
                <label htmlFor="initialSavings">Current Savings Balance (₹)</label>
                <input
                  id="initialSavings"
                  type="number"
                  name="initialSavings"
                  min="0"
                  value={formData.initialSavings}
                  onChange={handleInputChange}
                  placeholder="e.g., 1000"
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-success">Save Goal</button>
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

      {/* Goals Grid */}
      {data.goals && data.goals.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
          {data.goals.map((goal) => {
            const { saved, percent, linkedAssetName } = calculateGoalProgress(goal);
            const isCompleted = percent >= 100;

            return (
              <div key={goal.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
                {isCompleted && (
                  <div style={{ position: 'absolute', top: '10px', right: '10px', color: 'var(--success-color)', fontSize: '24px' }}>
                    <FaCircleCheck />
                  </div>
                )}
                
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', paddingRight: '30px' }}>
                    {goal.name}
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                    Target: <strong>{formatCurrency(goal.targetAmount)}</strong> by {new Date(goal.targetDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                  </div>

                  {/* Progress info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                    <span>Progress</span>
                    <span style={{ fontWeight: 'bold' }}>{percent.toFixed(0)}%</span>
                  </div>

                  {/* Progress Bar Container */}
                  <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px', overflow: 'hidden', marginBottom: '12px' }}>
                    <div 
                      style={{ 
                        width: `${percent}%`, 
                        height: '100%', 
                        backgroundColor: isCompleted ? 'var(--success-color)' : 'var(--primary-color)',
                        borderRadius: '5px',
                        transition: 'width 0.5s ease-out'
                      }} 
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                    <span>Saved: {formatCurrency(saved)}</span>
                    <span>Remaining: {formatCurrency(Math.max(0, goal.targetAmount - saved))}</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {linkedAssetName ? (
                      <>
                        <FaLink style={{ color: 'var(--primary-color)' }} /> Linked: {linkedAssetName}
                      </>
                    ) : (
                      'Manual tracking'
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: '#f1f5f9', borderRadius: '4px', color: '#475569' }}>
                      {getMonthsRemaining(goal.targetDate)} left
                    </span>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this goal?')) {
                          deleteGoal(goal.id);
                        }
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger-color)', display: 'flex', alignItems: 'center' }}
                      title="Delete goal"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: '60px', textAlign: 'center', backgroundColor: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <FaBullseye size={48} style={{ color: 'var(--text-secondary)', marginBottom: '15px' }} />
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '20px' }}>No financial goals yet. Create your first goal to track your wealth progress!</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Your First Goal</button>
        </div>
      )}
    </>
  );
}
