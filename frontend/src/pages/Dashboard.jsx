import { useFinance } from '../hooks/useFinance';
import { FaHouse, FaChartLine } from 'react-icons/fa6';
import { 
  formatCurrency, 
  calculateTotalAssets, 
  calculateTotalExpenses, 
  calculateNetWorth, 
  getCurrentMonthExpenses 
} from '../utils/storage';
import { LiveMarketUpdates } from '../components/LiveMarketUpdates';

export function Dashboard() {
  const { data, loading } = useFinance();

  if (loading || !data) {
    return <><h1 className="page-title"><FaHouse style={{ display: 'inline', marginRight: '8px' }} /> Dashboard</h1><p>Loading...</p></>;
  }

  const totalAssets = calculateTotalAssets(data.assets);
  const totalExpenses = calculateTotalExpenses(data.expenses);
  const netWorth = calculateNetWorth(totalAssets, totalExpenses);
  const monthlyExpenses = getCurrentMonthExpenses(data.expenses);
  const savings = (data.profile.total_income || data.profile.income || 0) - (data.profile.total_expenses || data.profile.expenses || 0);

  return (
    <>
      <div className="dashboard-hero">
        <div>
          <div className="hero-pill">Welcome back</div>
          <h1 className="page-title"><FaHouse style={{ display: 'inline', marginRight: '8px' }} /> Dashboard</h1>
          <p className="hero-copy">Track every milestone, stay on top of spending, and keep your goals moving with a calmer view of your money.</p>
        </div>
        <div className="hero-summary">
          <div>
          
          </div>
          <div>
           
          </div>
        </div>
      </div>

      <div className="dashboard-cards">
        <div className="card">
          <div className="card-title">Net Worth</div>
          <div className="card-value" style={{ color: netWorth >= 0 ? '#27ae60' : '#e74c3c' }}>
            {formatCurrency(netWorth)}
          </div>
          <div className="card-subtitle">Total Assets - Total Expenses</div>
        </div>

        <div className="card">
          <div className="card-title">Total Assets</div>
          <div className="card-value">{formatCurrency(totalAssets)}</div>
          <div className="card-subtitle">{data.assets.length} assets</div>
        </div>

        <div className="card">
          <div className="card-title">Monthly Expenses</div>
          <div className="card-value">{formatCurrency(monthlyExpenses)}</div>
          <div className="card-subtitle">This month</div>
        </div>

        <div className="card">
          <div className="card-title">Savings</div>
          <div className="card-value" style={{ color: savings >= 0 ? '#27ae60' : '#e74c3c' }}>
            {formatCurrency(savings)}
          </div>
          <div className="card-subtitle">Income - Expenses</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', marginTop: '40px' }}>
        {/* Net Worth Chart Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '320px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', alignSelf: 'flex-start', fontWeight: '600' }}>Net Worth Distribution</h2>
          
          {totalAssets === 0 && totalExpenses === 0 ? (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
              No financial data available to display distribution chart.
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <svg width="150" height="150" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    fill="transparent"
                    stroke="#e74c3c"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    fill="transparent"
                    stroke="#27ae60"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 35}
                    strokeDashoffset={(2 * Math.PI * 35) - ((totalAssets / (totalAssets + totalExpenses || 1)) * 2 * Math.PI * 35)}
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                  />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Assets Ratio</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {((totalAssets / (totalAssets + totalExpenses || 1)) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '150px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#27ae60' }} />
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Assets</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{formatCurrency(totalAssets)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#e74c3c' }} />
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Expenses</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{formatCurrency(totalExpenses)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Expenses Card */}
        <div className="card" style={{ minHeight: '320px', overflowX: 'auto' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: '600' }}>Recent Expenses</h2>
          {data.expenses.length > 0 ? (
            <table className="table" style={{ fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {data.expenses.slice(0, 5).map(expense => (
                  <tr key={expense.id}>
                    <td>{expense.description}</td>
                    <td style={{ fontWeight: '600', color: 'var(--danger-color)' }}>{formatCurrency(expense.amount)}</td>
                    <td><span style={{ padding: '2px 6px', backgroundColor: 'rgba(52,152,219,0.1)', borderRadius: '4px', fontSize: '11px' }}>{expense.category}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No financial data available to display distribution chart.
            </div>
          )}
        </div>
      </div>

      {/* Live Market Updates Section */}
      <div style={{ marginTop: '40px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaChartLine size={18} style={{ color: 'var(--primary-color)', opacity: 0.7 }} />
          Live Market Updates
          <span style={{ fontSize: '10px', color: '#00ff88', fontWeight: 400, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#00ff88', animation: 'live-pulse 1.5s ease-in-out infinite' }} />
            REAL-TIME
          </span>
        </h2>
        <LiveMarketUpdates />
      </div>
    </>);
}
