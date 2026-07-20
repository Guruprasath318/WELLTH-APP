import { useState, useEffect } from 'react';
import { useFinance } from '../hooks/useFinance';
import { FaPercent, FaChartLine, FaPlus, FaTableCells } from 'react-icons/fa6';
import { formatCurrency } from '../utils/storage';

export function Calculators() {
  const { addAsset } = useFinance();
  const [activeTab, setActiveTab] = useState('SIP');

  // Input states
  const [amount, setAmount] = useState(5000); // monthly or one-time principal
  const [rate, setRate] = useState(12); // expected return rate (%)
  const [years, setYears] = useState(10); // time period (years)
  const [compounding, setCompounding] = useState('Quarterly'); // compound frequency for Lumpsum/FD

  // Result states
  const [invested, setInvested] = useState(0);
  const [returns, setReturns] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [yearlySchedule, setYearlySchedule] = useState([]);

  // Reset defaults on tab change
  useEffect(() => {
    if (activeTab === 'SIP') {
      setAmount(5000);
      setRate(12);
      setYears(10);
    } else if (activeTab === 'Lumpsum') {
      setAmount(100000);
      setRate(12);
      setYears(10);
    } else if (activeTab === 'FD') {
      setAmount(100000);
      setRate(7.1);
      setYears(5);
    } else if (activeTab === 'RD') {
      setAmount(5000);
      setRate(6.8);
      setYears(5);
    } else if (activeTab === 'EMI') {
      setAmount(500000); // Loan amount
      setRate(8.5); // Interest rate
      setYears(20); // Duration in years (converted to months internally)
    } else if (activeTab === 'Inflation') {
      setAmount(100000); // Current amount
      setRate(5.5); // Inflation rate
      setYears(10); // Years
    } else if (activeTab === 'Retirement') {
      setAmount(50000); // Monthly investment
      setRate(10); // Expected return
      setYears(30); // Years till retirement
    }
  }, [activeTab]);

  // Recalculate values when inputs change
  useEffect(() => {
    let totalInvested = 0;
    let maturityVal = 0;
    let schedule = [];

    const p = parseFloat(amount) || 0;
    const r = parseFloat(rate) || 0;
    const t = parseFloat(years) || 0;

    if (p <= 0 || r <= 0 || t <= 0) {
      setInvested(0);
      setReturns(0);
      setTotalValue(0);
      setYearlySchedule([]);
      return;
    }

    if (activeTab === 'SIP') {
      const monthlyRate = r / 12 / 100;
      const totalMonths = t * 12;
      totalInvested = p * totalMonths;
      maturityVal = p * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);

      // Generate yearly schedule
      let runningValue = 0;
      let runningInvested = 0;
      for (let y = 1; y <= t; y++) {
        const months = y * 12;
        const yearInvested = p * 12;
        runningInvested += yearInvested;
        const yearMaturity = p * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
        const yearInterest = yearMaturity - runningInvested;
        schedule.push({
          year: y,
          invested: runningInvested,
          interest: Math.max(0, yearInterest),
          balance: yearMaturity
        });
      }
    } else if (activeTab === 'Lumpsum') {
      totalInvested = p;
      let timesCompoundedPerYear = 1;
      if (compounding === 'Monthly') timesCompoundedPerYear = 12;
      else if (compounding === 'Quarterly') timesCompoundedPerYear = 4;
      else if (compounding === 'Half-Yearly') timesCompoundedPerYear = 2;

      maturityVal = p * Math.pow(1 + (r / 100) / timesCompoundedPerYear, timesCompoundedPerYear * t);

      // Generate yearly schedule
      for (let y = 1; y <= t; y++) {
        const yearMaturity = p * Math.pow(1 + (r / 100) / timesCompoundedPerYear, timesCompoundedPerYear * y);
        schedule.push({
          year: y,
          invested: p,
          interest: Math.max(0, yearMaturity - p),
          balance: yearMaturity
        });
      }
    } else if (activeTab === 'FD') {
      totalInvested = p;
      // standard FD is compounded quarterly
      maturityVal = p * Math.pow(1 + (r / 400), 4 * t);

      // Generate yearly schedule
      for (let y = 1; y <= t; y++) {
        const yearMaturity = p * Math.pow(1 + (r / 400), 4 * y);
        schedule.push({
          year: y,
          invested: p,
          interest: Math.max(0, yearMaturity - p),
          balance: yearMaturity
        });
      }
    } else if (activeTab === 'RD') {
      const totalMonths = t * 12;
      totalInvested = p * totalMonths;
      
      // Standard Indian bank RD quarterly compounded formula
      const i = r / 400; // quarterly rate
      maturityVal = p * ((Math.pow(1 + i, totalMonths / 3) - 1) / (1 - Math.pow(1 + i, -1 / 3)));

      // Generate yearly schedule
      let runningInvested = 0;
      for (let y = 1; y <= t; y++) {
        const months = y * 12;
        runningInvested = p * months;
        const yearMaturity = p * ((Math.pow(1 + i, months / 3) - 1) / (1 - Math.pow(1 + i, -1 / 3)));
        schedule.push({
          year: y,
          invested: runningInvested,
          interest: Math.max(0, yearMaturity - runningInvested),
          balance: yearMaturity
        });
      }
    } else if (activeTab === 'EMI') {
      // Loan amount = p, Rate = r, Years = t
      // Convert years to months
      const totalMonths = t * 12;
      const monthlyRate = r / 12 / 100;
      
      // EMI Formula: P * [r(1+r)^n] / [(1+r)^n - 1]
      const emi = (p * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                  (Math.pow(1 + monthlyRate, totalMonths) - 1);
      
      totalInvested = emi * totalMonths; // Total amount to be paid
      maturityVal = totalInvested;
      setReturns(totalInvested - p); // Total interest paid

      // Generate yearly schedule
      let remainingBalance = p;
      for (let y = 1; y <= t; y++) {
        let yearInterest = 0;
        let yearPrincipal = 0;
        for (let m = 1; m <= 12; m++) {
          const interestPayment = remainingBalance * monthlyRate;
          const principalPayment = emi - interestPayment;
          yearInterest += interestPayment;
          yearPrincipal += principalPayment;
          remainingBalance -= principalPayment;
        }
        schedule.push({
          year: y,
          invested: yearPrincipal,
          interest: yearInterest,
          balance: Math.max(0, remainingBalance)
        });
      }

      setInvested(p);
      setTotalValue(maturityVal);
      setReturns(totalInvested - p);
      setYearlySchedule(schedule);
      return;
    } else if (activeTab === 'Inflation') {
      // Current amount = p, Inflation rate = r, Years = t
      // Future value = P * (1 + inflation_rate)^years
      totalInvested = p;
      maturityVal = p * Math.pow(1 + r / 100, t);

      // Generate yearly schedule showing purchasing power
      for (let y = 1; y <= t; y++) {
        const futureValue = p * Math.pow(1 + r / 100, y);
        const purchasingPowerLoss = p - futureValue + (p * y * r / 100);
        schedule.push({
          year: y,
          invested: p,
          interest: (futureValue - p) * -1,
          balance: p / Math.pow(1 + r / 100, y) // Equivalent purchasing power today
        });
      }
    } else if (activeTab === 'Retirement') {
      // SIP for retirement with ongoing contributions
      // p = monthly investment, r = expected return, t = years to retirement
      const monthlyRate = r / 12 / 100;
      const totalMonths = t * 12;
      totalInvested = p * totalMonths;
      maturityVal = p * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);

      // Generate yearly schedule
      let runningValue = 0;
      let runningInvested = 0;
      for (let y = 1; y <= t; y++) {
        const months = y * 12;
        runningInvested = p * 12 * y;
        const yearMaturity = p * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
        const yearInterest = yearMaturity - runningInvested;
        schedule.push({
          year: y,
          invested: runningInvested,
          interest: Math.max(0, yearInterest),
          balance: yearMaturity
        });
      }
    }

    setInvested(totalInvested);
    setTotalValue(maturityVal);
    setReturns(Math.max(0, maturityVal - totalInvested));
    setYearlySchedule(schedule);
  }, [activeTab, amount, rate, years, compounding]);

  const handleSaveAsAsset = () => {
    let assetType = 'Investment';
    let assetName = '';
    
    if (activeTab === 'EMI') {
      assetName = `Loan EMI Plan - ${years} Yrs`;
      assetType = 'Loan';
    } else if (activeTab === 'Inflation') {
      alert('Inflation Calculator is for information purposes. Plan an investment to counter inflation!');
      return;
    } else if (activeTab === 'Retirement') {
      assetName = `Retirement Plan - ${years} Yrs`;
      assetType = 'Retirement';
    } else {
      assetName = `${activeTab} Plan - ${years} Yrs`;
      assetType = 'Investment';
    }

    if (activeTab !== 'Inflation') {
      addAsset({
        name: assetName,
        value: Math.round(activeTab === 'EMI' ? amount : totalValue),
        type: assetType,
        description: `${activeTab} Calculator: Principal/Investment: ${formatCurrency(amount)}, Rate: ${rate}%, Duration: ${years} Years. ${activeTab === 'EMI' ? `Monthly EMI: ${formatCurrency((amount * (rate/12/100) * Math.pow(1 + (rate/12/100), years * 12)) / (Math.pow(1 + (rate/12/100), years * 12) - 1))}` : `Total Value: ${formatCurrency(totalValue)}`}`
      });
      alert(`Plan successfully added to your Assets!`);
    }
  };

  // SVG Donut Chart parameters
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const total = invested + returns;
  const investedPercent = total > 0 ? (invested / total) * 100 : 50;
  const returnsPercent = total > 0 ? (returns / total) * 100 : 50;
  // Stroke dashoffset: represent returns
  const returnsDashoffset = circumference - (returnsPercent / 100) * circumference;

  return (
    <>
      <h1 className="page-title"><FaPercent style={{ display: 'inline', marginRight: '8px' }} /> Financial Calculators</h1>

      {/* Tabs */}
      <div className="calculator-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
        {['SIP', 'Lumpsum', 'FD', 'RD', 'EMI', 'Inflation', 'Retirement'].map((tab) => (
          <button
            key={tab}
            className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(tab)}
            style={{ minWidth: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <FaChartLine style={{ fontSize: activeTab === tab ? '16px' : '14px' }} /> {tab}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', alignItems: 'start' }}>
        
        {/* Input Parameters Card */}
        <div className="card" style={{ padding: '30px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '25px', color: 'var(--text-primary)', fontWeight: '600' }}>
            {activeTab === 'EMI' ? 'EMI Calculator' : 
             activeTab === 'Inflation' ? 'Inflation Calculator' :
             activeTab === 'Retirement' ? 'Retirement Planner' : `${activeTab} Parameters`}
          </h2>

          {/* Amount slider/input */}
          <div className="form-group" style={{ marginBottom: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label htmlFor="amount" style={{ fontWeight: '500' }}>
                {activeTab === 'SIP' || activeTab === 'RD' ? 'Monthly Investment' : 
                 activeTab === 'EMI' ? 'Loan Amount' :
                 activeTab === 'Inflation' ? 'Current Amount' :
                 activeTab === 'Retirement' ? 'Monthly Investment' : 'Principal Amount'}
              </label>
              <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                {formatCurrency(amount)}
              </span>
            </div>
            <input
              id="amount-input"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
              style={{ marginBottom: '12px' }}
            />
            <input
              id="amount"
              type="range"
              min={activeTab === 'SIP' || activeTab === 'RD' || activeTab === 'Retirement' ? 500 : 
                   activeTab === 'EMI' ? 50000 : 1000}
              max={activeTab === 'SIP' || activeTab === 'RD' ? 100000 : 
                   activeTab === 'EMI' ? 5000000 :
                   activeTab === 'Retirement' ? 500000 : 1000000}
              step={activeTab === 'SIP' || activeTab === 'RD' ? 500 : 
                    activeTab === 'Retirement' ? 1000 : 5000}
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>

          {/* Rate slider/input */}
          <div className="form-group" style={{ marginBottom: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label htmlFor="rate" style={{ fontWeight: '500' }}>
                {activeTab === 'EMI' ? 'Interest Rate (%)' :
                 activeTab === 'Inflation' ? 'Inflation Rate (%)' : 'Expected Return Rate (%)'}
              </label>
              <span style={{ fontWeight: 'bold', color: 'var(--success-color)' }}>{rate.toFixed(2)}%</span>
            </div>
            <input
              id="rate-input"
              type="number"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(Math.max(0, parseFloat(e.target.value) || 0))}
              style={{ marginBottom: '12px' }}
            />
            <input
              id="rate"
              type="range"
              min="0.1"
              max="30"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>

          {/* Years slider/input */}
          <div className="form-group" style={{ marginBottom: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label htmlFor="years" style={{ fontWeight: '500' }}>
                {activeTab === 'EMI' ? 'Loan Duration (Years)' :
                 activeTab === 'Retirement' ? 'Years to Retirement' : 'Time Period (Years)'}
              </label>
              <span style={{ fontWeight: 'bold', color: 'var(--warning-color)' }}>{years} Years</span>
            </div>
            <input
              id="years-input"
              type="number"
              value={years}
              onChange={(e) => setYears(Math.max(1, parseInt(e.target.value) || 0))}
              style={{ marginBottom: '12px' }}
            />
            <input
              id="years"
              type="range"
              min="1"
              max="40"
              step="1"
              value={years}
              onChange={(e) => setYears(parseInt(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>

          {/* Compounding Select (Lumpsum Only) */}
          {activeTab === 'Lumpsum' && (
            <div className="form-group" style={{ marginBottom: '25px' }}>
              <label htmlFor="compounding" style={{ fontWeight: '500' }}>Compounding Frequency</label>
              <select
                id="compounding"
                value={compounding}
                onChange={(e) => setCompounding(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
              >
                <option value="Yearly">Yearly (Simple Compound)</option>
                <option value="Half-Yearly">Half-Yearly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
          )}
        </div>

        {/* Results Card with Donut Chart */}
        <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', color: 'var(--text-primary)', fontWeight: '600' }}>
            Calculation Summary
          </h2>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '20px 0', position: 'relative' }}>
            {/* SVG Ring Chart */}
            <svg width="200" height="200" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background Circle - Invested */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke={activeTab === 'Inflation' ? '#e74c3c' : 'var(--primary-color)'}
                strokeWidth="12"
              />
              {/* Foreground Circle - Returns/Interest */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke={activeTab === 'EMI' ? '#f39c12' : '#a29bfe'}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={returnsDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
              />
            </svg>
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                {activeTab === 'EMI' ? 'Total Amount' : activeTab === 'Inflation' ? 'Future Value' : 'Est. Maturity'}
              </span>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{formatCurrency(totalValue)}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px', textAlign: 'left' }}>
            <div style={{ padding: '15px', backgroundColor: activeTab === 'EMI' ? 'rgba(243, 156, 18, 0.05)' : 'rgba(52, 152, 219, 0.05)', borderRadius: '8px', borderLeft: `4px solid ${activeTab === 'EMI' ? '#f39c12' : 'var(--primary-color)'}` }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {activeTab === 'EMI' ? 'Principal Amount' : activeTab === 'Inflation' ? 'Current Amount' : 'Total Invested'}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: activeTab === 'EMI' ? '#f39c12' : 'var(--primary-color)' }}>{formatCurrency(invested)}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{investedPercent.toFixed(1)}% of total</div>
            </div>

            <div style={{ padding: '15px', backgroundColor: activeTab === 'Inflation' ? 'rgba(231, 76, 60, 0.05)' : 'rgba(162, 155, 254, 0.05)', borderRadius: '8px', borderLeft: `4px solid ${activeTab === 'Inflation' ? '#e74c3c' : '#a29bfe'}` }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {activeTab === 'EMI' ? 'Total Interest' : activeTab === 'Inflation' ? 'Purchasing Power Loss' : 'Est. Returns'}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: activeTab === 'Inflation' ? '#e74c3c' : '#6c5ce7' }}>{formatCurrency(returns)}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{returnsPercent.toFixed(1)}% of total</div>
            </div>
          </div>

          {activeTab === 'EMI' && (
            <div style={{ padding: '15px', backgroundColor: 'rgba(46, 204, 113, 0.1)', borderRadius: '8px', marginTop: '15px', border: '2px solid #2ecc71' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Monthly EMI</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>
                {formatCurrency((amount * (rate/12/100) * Math.pow(1 + (rate/12/100), years * 12)) / (Math.pow(1 + (rate/12/100), years * 12) - 1))}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>for {years * 12} months</div>
            </div>
          )}

          {activeTab !== 'Inflation' && (
            <button
              onClick={handleSaveAsAsset}
              className="btn btn-success"
              style={{ width: '100%', marginTop: '30px', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              <FaPlus /> {activeTab === 'EMI' ? 'Add Loan to Assets' : 'Add to Assets'}
            </button>
          )}
        </div>
      </div>

      {/* Yearly Schedule Table */}
      {yearlySchedule.length > 0 && (
        <div className="card" style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaTableCells /> {activeTab === 'EMI' ? 'Loan Amortization Schedule' : activeTab === 'Inflation' ? 'Inflation Impact Projection' : 'Yearly Growth Projections'}
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px' }}>Year</th>
                  <th style={{ padding: '12px' }}>
                    {activeTab === 'EMI' ? 'Principal Paid' : activeTab === 'Inflation' ? 'Current Amount' : 'Invested Amount'}
                  </th>
                  <th style={{ padding: '12px' }}>
                    {activeTab === 'EMI' ? 'Interest Paid' : activeTab === 'Inflation' ? 'Loss' : 'Est. Interest Earned'}
                  </th>
                  <th style={{ padding: '12px' }}>
                    {activeTab === 'EMI' ? 'Outstanding Balance' : activeTab === 'Inflation' ? 'Purchasing Power' : 'Projected Balance'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {yearlySchedule.map((row) => (
                  <tr key={row.year}>
                    <td style={{ padding: '12px' }}><strong>Year {row.year}</strong></td>
                    <td style={{ padding: '12px' }}>{formatCurrency(row.invested)}</td>
                    <td style={{ padding: '12px', color: activeTab === 'Inflation' ? '#e74c3c' : '#27ae60' }}>
                      {formatCurrency(row.interest)}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: row.balance <= 0 ? '#27ae60' : 'var(--text-primary)' }}>
                      {formatCurrency(row.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
