import { useFinance } from '../hooks/useFinance';
import { FaCircleCheck, FaCheck } from 'react-icons/fa6';
import { formatCurrency, calculateSavingsRate, getSavingsStatus } from '../utils/storage';

export function Essentials() {
  const { data, loading } = useFinance();

  if (loading || !data) {
    return <><h1 className="page-title"><FaCircleCheck style={{ display: 'inline', marginRight: '8px' }} /> Essentials</h1><p>Loading...</p></>;
  }

  const profile = data.profile;
  const income = profile.income || profile.total_income || 0;
  const expenses = profile.expenses || profile.total_expenses || 0;
  const savingsRate = calculateSavingsRate(income, expenses);
  const savingsStatus = getSavingsStatus(savingsRate);

  // Calculate recommended savings
  const recommendedSavings = income * 0.20; // 20% recommended
  const recommendedExpenses = income * 0.50; // 50% recommended
  const investmentRecommendation = income * 0.30; // 30% recommended

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const age = profile.age || 0;
  const retirementAge = 65;
  const yearsToRetirement = Math.max(0, retirementAge - age);

  return (
    <>
      <h1 className="page-title"><FaCircleCheck style={{ display: 'inline', marginRight: '8px' }} /> Essentials</h1>

      <div className="dashboard-cards" style={{ marginBottom: '40px' }}>
        <div className="card">
          <div className="card-title">Annual Income</div>
          <div className="card-value" style={{ color: '#27ae60' }}>
            {formatCurrency(profile.income)}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Annual Expenses</div>
          <div className="card-value" style={{ color: '#e74c3c' }}>
            {formatCurrency(profile.expenses)}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Savings Rate</div>
          <div className="card-value" style={{ color: savingsRate >= 20 ? '#27ae60' : '#f39c12' }}>
            {savingsRate.toFixed(1)}%
          </div>
          <div className="card-subtitle">Status: {savingsStatus}</div>
        </div>

        <div className="card">
          <div className="card-title">Years to Retirement</div>
          <div className="card-value">
            {yearsToRetirement}
          </div>
          <div className="card-subtitle">Age {age} → {retirementAge}</div>
        </div>
      </div>

      <div className="responsive-page-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        <div className="card">
          <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>50/30/20 Rule</h2>
          <p style={{ marginBottom: '20px', color: '#7f8c8d', fontSize: '14px' }}>
            The 50/30/20 rule is a budgeting guideline that suggests allocating your income as follows:
          </p>
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Percentage</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Needs (Essentials)</strong></td>
                <td>50%</td>
                <td>{formatCurrency(recommendedExpenses)}</td>
              </tr>
              <tr>
                <td><strong>Wants (Fun/Lifestyle)</strong></td>
                <td>30%</td>
                <td>{formatCurrency(investmentRecommendation)}</td>
              </tr>
              <tr>
                <td><strong>Savings/Investments</strong></td>
                <td>20%</td>
                <td>{formatCurrency(recommendedSavings)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Financial Health Score</h2>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', marginBottom: '10px' }}>Savings Rate</div>
            <div style={{
              width: '100%',
              height: '20px',
              backgroundColor: '#ecf0f1',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${Math.min(savingsRate, 100)}%`,
                height: '100%',
                backgroundColor: savingsRate >= 20 ? '#27ae60' : savingsRate >= 10 ? '#f39c12' : '#e74c3c',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
              {savingsRate.toFixed(1)}% (Goal: 20%)
            </div>
          </div>

          <div>
            <div style={{ fontSize: '14px', marginBottom: '10px' }}>Expense to Income Ratio</div>
            <div style={{
              width: '100%',
              height: '20px',
              backgroundColor: '#ecf0f1',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${Math.min((expenses / (income || 1)) * 100, 100)}%`,
                height: '100%',
                backgroundColor: (expenses / (income || 1)) <= 0.8 ? '#27ae60' : '#e74c3c',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
              {((expenses / (income || 1)) * 100).toFixed(1)}% (Goal: &lt;80%)
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Financial Tips</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '12px', paddingLeft: '24px', position: 'relative' }}>
            <FaCheck style={{ position: 'absolute', left: 0 }} />
            <strong>Track your spending:</strong> Monitor expenses regularly to identify areas for improvement
          </li>
          <li style={{ marginBottom: '12px', paddingLeft: '24px', position: 'relative' }}>
            <FaCheck style={{ position: 'absolute', left: 0 }} />
            <strong>Build an emergency fund:</strong> Save 3-6 months of expenses for unexpected situations
          </li>
          <li style={{ marginBottom: '12px', paddingLeft: '24px', position: 'relative' }}>
            <FaCheck style={{ position: 'absolute', left: 0 }} />
            <strong>Invest early:</strong> Start investing as soon as possible to benefit from compound growth
          </li>
          <li style={{ marginBottom: '12px', paddingLeft: '24px', position: 'relative' }}>
            <FaCheck style={{ position: 'absolute', left: 0 }} />
            <strong>Set financial goals:</strong> Define clear short and long-term financial objectives
          </li>
          <li style={{ paddingLeft: '24px', position: 'relative' }}>
            <FaCheck style={{ position: 'absolute', left: 0 }} />
            <strong>Review regularly:</strong> Check your progress monthly and adjust as needed
          </li>
        </ul>
      </div>
    </>
  );
}
