import { useFinance } from '../hooks/useFinance';
import { FaChartBar } from 'react-icons/fa6';
import { formatCurrency } from '../utils/storage';

export function Reports() {
  const { data, loading } = useFinance();

  if (loading || !data) {
    return <><h1 className="page-title">Reports</h1><p>Loading...</p></>;
  }

  const totalIncome = data.incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpenses = data.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalAssets = data.assets.reduce((sum, asset) => sum + asset.value, 0);

  // Group expenses by category
  const expensesByCategory = {};
  data.expenses.forEach(expense => {
    expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + expense.amount;
  });

  // Group expenses by month
  const expensesByMonth = {};
  data.expenses.forEach(expense => {
    const date = new Date(expense.date);
    const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    expensesByMonth[month] = (expensesByMonth[month] || 0) + expense.amount;
  });

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(2) : 0;

  return (
    <>
      <h1 className="page-title"><FaChartBar style={{ display: 'inline', marginRight: '8px' }} /> Reports</h1>

      <div className="dashboard-cards" style={{ marginBottom: '40px' }}>
        <div className="card">
          <div className="card-title">Total Income</div>
          <div className="card-value" style={{ color: '#27ae60' }}>
            {formatCurrency(totalIncome)}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Total Expenses</div>
          <div className="card-value" style={{ color: '#e74c3c' }}>
            {formatCurrency(totalExpenses)}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Net Income</div>
          <div className="card-value" style={{ color: totalIncome - totalExpenses >= 0 ? '#27ae60' : '#e74c3c' }}>
            {formatCurrency(totalIncome - totalExpenses)}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Savings Rate</div>
          <div className="card-value" style={{ color: savingsRate >= 20 ? '#27ae60' : '#f39c12' }}>
            {savingsRate}%
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginTop: '30px' }}>
        {/* Category Breakdown Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: '600' }}>Expenses by Category</h2>
          
          {Object.keys(expensesByCategory).length > 0 ? (
            <>
              {/* SVG Donut Chart */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '10px 0 25px 0', gap: '30px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <svg width="160" height="160" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="30" fill="transparent" stroke="var(--border-color)" strokeWidth="10" />
                    {(() => {
                      const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];
                      const total = Object.values(expensesByCategory).reduce((sum, a) => sum + a, 0);
                      const circ = 2 * Math.PI * 30;
                      let currentRotation = -90; // Start at top
                      
                      return Object.entries(expensesByCategory).map(([category, amount], index) => {
                        const percent = (amount / total) * 100;
                        const strokeLength = (percent / 100) * circ;
                        const rotate = currentRotation;
                        currentRotation += (percent / 100) * 360;
                        
                        return (
                          <circle
                            key={category}
                            cx="50"
                            cy="50"
                            r="30"
                            fill="transparent"
                            stroke={colors[index % colors.length]}
                            strokeWidth="10"
                            strokeDasharray={`${strokeLength} ${circ}`}
                            transform={`rotate(${rotate} 50 50)`}
                            style={{ transition: 'stroke-dasharray 0.5s ease-out' }}
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div style={{ position: 'absolute', textAlign: 'center' }}>
                    <div style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total</div>
                    <div style={{ fontSize: '15px', fontWeight: 'bold' }}>{formatCurrency(totalExpenses)}</div>
                  </div>
                </div>

                {/* Colored Legend */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '150px' }}>
                  {(() => {
                    const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];
                    return Object.entries(expensesByCategory).map(([category, amount], index) => {
                      const percent = totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0;
                      return (
                        <div key={category} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: colors[index % colors.length] }} />
                          <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{category}</span>
                          <span style={{ color: 'var(--text-secondary)', marginLeft: 'auto' }}>{percent}%</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Data Table */}
              <table className="table" style={{ fontSize: '13px', marginTop: 'auto' }}>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(expensesByCategory).map(([category, amount]) => (
                    <tr key={category}>
                      <td><strong>{category}</strong></td>
                      <td>{formatCurrency(amount)}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No category expense data available
            </div>
          )}
        </div>

        {/* Monthly Trend Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: '600' }}>Expenses by Month</h2>
          
          {Object.keys(expensesByMonth).length > 0 ? (
            <>
              {/* SVG Bar Chart */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0 25px 0' }}>
                <svg width="100%" height="160" viewBox="0 0 300 120" style={{ overflow: 'visible' }}>
                  {(() => {
                    const monthsData = Object.entries(expensesByMonth).reverse(); // Oldest first
                    const maxVal = Math.max(...monthsData.map(([_, val]) => val), 0) || 1;
                    const chartHeight = 85;
                    const chartWidth = 260;
                    const barWidth = Math.max(12, 180 / monthsData.length);
                    const gap = (chartWidth - (monthsData.length * barWidth)) / (monthsData.length + 1);

                    return (
                      <>
                        {/* Grid lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                          const y = chartHeight - (ratio * chartHeight) + 10;
                          return (
                            <line
                              key={ratio}
                              x1="20"
                              y1={y}
                              x2="290"
                              y2={y}
                              stroke="var(--border-color)"
                              strokeWidth="0.5"
                              strokeDasharray="2 2"
                            />
                          );
                        })}

                        {/* Bars */}
                        {monthsData.map(([month, amount], index) => {
                          const barHeight = (amount / maxVal) * chartHeight;
                          const x = 25 + gap + index * (barWidth + gap);
                          const y = chartHeight - barHeight + 10;
                          
                          return (
                            <g key={month}>
                              {/* Hoverable Bar */}
                              <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                fill="var(--primary-color)"
                                rx="3"
                                ry="3"
                                style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
                              />
                              {/* Label above bar */}
                              <text
                                x={x + barWidth / 2}
                                y={y - 4}
                                textAnchor="middle"
                                fontSize="7px"
                                fontWeight="bold"
                                fill="var(--text-primary)"
                              >
                                {formatCurrency(amount).split('.')[0]}
                              </text>
                              {/* Axis Label at bottom */}
                              <text
                                x={x + barWidth / 2}
                                y={chartHeight + 22}
                                textAnchor="middle"
                                fontSize="7px"
                                fill="var(--text-secondary)"
                              >
                                {month.split(' ')[0]}
                              </text>
                            </g>
                          );
                        })}
                        {/* Axis baseline */}
                        <line x1="20" y1={chartHeight + 10} x2="290" y2={chartHeight + 10} stroke="var(--text-secondary)" strokeWidth="0.8" />
                      </>
                    );
                  })()}
                </svg>
              </div>

              {/* Data Table */}
              <table className="table" style={{ fontSize: '13px', marginTop: 'auto' }}>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Total Expenses</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(expensesByMonth).map(([month, amount]) => (
                    <tr key={month}>
                      <td><strong>{month}</strong></td>
                      <td style={{ fontWeight: '600', color: 'var(--danger-color)' }}>{formatCurrency(amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No monthly data available
            </div>
          )}
        </div>
      </div>
    </>
  );
}
