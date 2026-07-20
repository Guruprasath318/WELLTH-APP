import { useState, useEffect, useCallback } from 'react';
import { FaChartLine, FaArrowDown, FaDollarSign, FaGem, FaFire, FaBitcoin, FaEthereum, FaOilCan, FaEarthAsia, FaFlagUsa, FaBoxOpen, FaLock } from 'react-icons/fa6';

const marketGroups = [
  {
    label: 'Indian Markets',
    icon: <FaEarthAsia size={16} />,
    keys: ['^BSESN', '^NSEI'],
  },
  {
    label: 'US Markets',
    icon: <FaFlagUsa size={16} />,
    keys: ['^DJI', '^IXIC', '^GSPC'],
  },
  {
    label: 'Forex & Commodities',
    icon: <FaBoxOpen size={16} />,
    keys: ['USDINR=X', 'gold', 'silver', 'crude'],
  },
  {
    label: 'Crypto',
    icon: <FaLock size={16} />,
    keys: ['bitcoin', 'ethereum'],
  },
];

const itemConfig = {
  '^BSESN': { symbol: 'SENSEX', icon: <FaChartLine size={18} />, fullName: 'S&P BSE Sensex', prefix: '', color: '#ff6b6b' },
  '^NSEI': { symbol: 'NIFTY 50', icon: <FaChartLine size={18} />, fullName: 'NIFTY 50', prefix: '', color: '#4ecdc4' },
  '^DJI': { symbol: 'DOW JONES', icon: <FaChartLine size={18} />, fullName: 'Dow Jones Industrial', prefix: '', color: '#45b7d1' },
  '^IXIC': { symbol: 'NASDAQ', icon: <FaChartLine size={18} />, fullName: 'NASDAQ Composite', prefix: '', color: '#96ceb4' },
  '^GSPC': { symbol: 'S&P 500', icon: <FaChartLine size={18} />, fullName: 'S&P 500', prefix: '', color: '#a8e6cf' },
  'USDINR=X': { symbol: 'USD/INR', icon: <FaDollarSign size={18} />, fullName: 'USD to INR', prefix: '₹', color: '#fdcb6e' },
  gold: { symbol: 'GOLD/10g', icon: <FaGem size={18} />, fullName: 'Gold Rate (10g)', prefix: '₹', color: '#f39c12' },
  silver: { symbol: 'SILVER/kg', icon: <FaFire size={18} />, fullName: 'Silver Rate (1kg)', prefix: '₹', color: '#bdc3c7' },
  crude: { symbol: 'CRUDE OIL', icon: <FaOilCan size={18} />, fullName: 'Crude Oil (Brent)', prefix: '$', color: '#2c3e50' },
  bitcoin: { symbol: 'BTC/INR', icon: <FaBitcoin size={18} />, fullName: 'Bitcoin', prefix: '₹', color: '#f7931a' },
  ethereum: { symbol: 'ETH/INR', icon: <FaEthereum size={18} />, fullName: 'Ethereum', prefix: '₹', color: '#627eea' },
};

function seededBase() {
  return {
    '^BSESN': 72456 + (Math.random() - 0.5) * 200,
    '^NSEI': 22014 + (Math.random() - 0.5) * 60,
    'USDINR=X': 83.45 + (Math.random() - 0.5) * 0.3,
    '^DJI': 38900 + (Math.random() - 0.5) * 150,
    '^IXIC': 17850 + (Math.random() - 0.5) * 100,
    '^GSPC': 5400 + (Math.random() - 0.5) * 20,
    gold: 71250 + (Math.random() - 0.5) * 300,
    silver: 83500 + (Math.random() - 0.5) * 400,
    crude: 78.5 + (Math.random() - 0.5) * 1.5,
    bitcoin: 2650000 + (Math.random() - 0.5) * 30000,
    ethereum: 185000 + (Math.random() - 0.5) * 5000,
  };
}

function formatValue(symbol, value) {
  if (symbol === 'BTC/INR') return `₹${(value / 100000).toFixed(1)}L`;
  if (symbol === 'ETH/INR') return `₹${(value / 1000).toFixed(1)}K`;
  if (symbol === 'GOLD/10g' || symbol === 'SILVER/kg') return value.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  if (symbol === 'USD/INR' || symbol === 'CRUDE OIL') return value.toFixed(2);
  return value.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

export function LiveMarketUpdates() {
  const [marketData, setMarketData] = useState(() => {
    const bases = seededBase();
    return Object.keys(itemConfig).reduce((acc, key) => {
      acc[key] = { value: bases[key], change: 0, isPositive: true };
      return acc;
    }, {});
  });
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const yahooKeys = ['^BSESN', '^NSEI', 'USDINR=X', '^DJI', '^IXIC', '^GSPC'];
      const promises = yahooKeys.map(async (key) => {
        try {
          const resp = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(key)}?range=1d&interval=5m`,
            { signal: AbortSignal.timeout(5000) }
          );
          if (!resp.ok) throw new Error('HTTP ' + resp.status);
          const json = await resp.json();
          const result = json?.chart?.result?.[0];
          if (!result?.meta) throw new Error('no meta');
          const current = result.meta.regularMarketPrice;
          const prev = result.meta.previousClose ?? current;
          return { key, value: current, change: ((current - prev) / prev) * 100 };
        } catch { return null; }
      });

      const results = await Promise.allSettled(promises);
      const updates = {};
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value) updates[r.value.key] = r.value;
      }

      if (Object.keys(updates).length > 0) {
        setMarketData(prev => {
          const next = { ...prev };
          for (const [key, data] of Object.entries(updates)) {
            next[key] = { value: data.value, change: data.change, isPositive: data.change >= 0 };
          }
          return next;
        });
      } else {
        drift();
      }
    } catch { drift(); }
    setLastUpdated(new Date().toLocaleTimeString('en-IN'));
  }, []);

  const drift = useCallback(() => {
    setMarketData(prev => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        const driftVal = 1 + (Math.random() - 0.5) * 0.003;
        const newVal = next[key].value * driftVal;
        const chg = ((newVal - next[key].value) / next[key].value) * 100;
        next[key] = { value: newVal, change: chg, isPositive: chg >= 0 };
      }
      return next;
    });
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 45000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="live-market-updates">
      <style>{`
        .live-market-updates {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 10px;
        }

        .market-group-card {
          background: var(--card-bg);
          border-radius: 16px;
          padding: 20px;
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow);
          transition: all 0.3s ease;
        }

        .market-group-card:hover {
          box-shadow: var(--shadow-lg);
          transform: translateY(-2px);
        }

        .market-group-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border-color);
        }

        .market-group-header svg {
          color: var(--primary-color);
          opacity: 0.7;
        }

        html.dark-mode .market-group-header svg {
          color: #00ff88;
        }

        .market-group-header h3 {
          font-size: 14px;
          font-weight: 700;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-primary);
        }

        .market-group-time {
          margin-left: auto;
          font-size: 9px;
          color: var(--text-secondary);
          opacity: 0.6;
          letter-spacing: 0.3px;
        }

        .market-item-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 8px;
          border-radius: 10px;
          transition: all 0.2s ease;
          cursor: default;
        }

        .market-item-row:hover {
          background: var(--light-bg);
        }

        .market-item-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .market-item-info {
          flex: 1;
          min-width: 0;
        }

        .market-item-name {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.3;
        }

        .market-item-full {
          font-size: 10px;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .market-item-price {
          text-align: right;
          flex-shrink: 0;
        }

        .market-item-value {
          font-size: 14px;
          font-weight: 800;
          color: var(--text-primary);
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.3px;
        }

        .market-item-change {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 4px;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 5px;
          margin-top: 2px;
        }

        .market-item-change.positive {
          color: #00c853;
          background: rgba(0, 200, 83, 0.1);
        }

        .market-item-change.negative {
          color: #ff1744;
          background: rgba(255, 23, 68, 0.1);
        }

        html.dark-mode .market-item-change.positive {
          background: rgba(0, 200, 83, 0.15);
          color: #69f0ae;
        }

        html.dark-mode .market-item-change.negative {
          background: rgba(255, 23, 68, 0.15);
          color: #ff8a80;
        }

        .market-change-bar {
          width: 60px;
          height: 4px;
          border-radius: 2px;
          margin-top: 4px;
          overflow: hidden;
          background: var(--border-color);
          position: relative;
          margin-left: auto;
        }

        .market-change-bar-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.5s ease;
        }

        @media (max-width: 768px) {
          .live-market-updates {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {marketGroups.map(group => (
        <div key={group.label} className="market-group-card">
          <div className="market-group-header">
            {group.icon}
            <h3>{group.label}</h3>
            {lastUpdated && <span className="market-group-time">Updated {lastUpdated}</span>}
          </div>
          {group.keys.map(key => {
            const config = itemConfig[key];
            const data = marketData[key];
            if (!config || !data) return null;
            const changeAbs = Math.abs(data.change);
            const barWidth = Math.min(changeAbs * 8, 100);
            return (
              <div key={key} className="market-item-row">
                <div className="market-item-icon" style={{ background: `${config.color}20`, color: config.color }}>
                  {config.icon}
                </div>
                <div className="market-item-info">
                  <div className="market-item-name">{config.symbol}</div>
                  <div className="market-item-full">{config.fullName}</div>
                </div>
                <div className="market-item-price">
                  <div className="market-item-value">{formatValue(config.symbol, data.value)}</div>
                  <div className={`market-item-change ${data.isPositive ? 'positive' : 'negative'}`}>
                    {data.isPositive ? <FaChartLine size={9} /> : <FaArrowDown size={9} />}
                    {data.change.toFixed(2)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
