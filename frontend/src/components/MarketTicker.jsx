import { useState, useEffect, useRef } from 'react';
import { FaChartLine, FaArrowDown, FaDollarSign, FaGem, FaFire, FaBitcoin, FaEthereum, FaOilCan } from 'react-icons/fa6';
import { useMarketData } from '../hooks/useMarketData';

const iconMap = {
  FaChartLine: <FaChartLine size={14} />,
  FaDollarSign: <FaDollarSign size={14} />,
  FaGem: <FaGem size={14} />,
  FaFire: <FaFire size={14} />,
  FaOilCan: <FaOilCan size={14} />,
  FaBitcoin: <FaBitcoin size={14} />,
  FaEthereum: <FaEthereum size={14} />,
};

export function MarketTicker() {
  const { marketData, lastUpdated, formatMarketValue } = useMarketData();
  const [flashIndices, setFlashIndices] = useState(new Set());
  const prevValuesRef = useRef({});

  useEffect(() => {
    const newFlash = new Set();
    marketData.forEach((item, idx) => {
      const prevVal = prevValuesRef.current[item.symbol];
      if (prevVal !== undefined && Math.abs(item.value - prevVal) / (prevVal || 1) > 0.001) {
        newFlash.add(idx);
      }
      prevValuesRef.current[item.symbol] = item.value;
    });
    if (newFlash.size > 0) {
      setFlashIndices(newFlash);
      const timer = setTimeout(() => setFlashIndices(new Set()), 600);
      return () => clearTimeout(timer);
    }
  }, [marketData]);

  const decorated = marketData.map(item => ({
    ...item,
    icon: iconMap[item.icon] || <FaChartLine size={14} />,
  }));

  return (
    <div className="market-ticker-container">
      <style>{`
        .market-ticker-container {
          background: linear-gradient(135deg, rgba(26, 26, 46, 0.04), rgba(45, 45, 68, 0.04));
          border-top: 2px solid var(--primary-color);
          border-bottom: 1px solid var(--border-color);
          overflow: hidden;
          height: 64px;
          display: flex;
          align-items: center;
          position: relative;
          flex-shrink: 0;
          margin-top: 70px;
        }

        html.dark-mode .market-ticker-container {
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.1));
          border-top-color: #00ff88;
          border-bottom-color: var(--border-color);
        }

        .ticker-label {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          background: linear-gradient(135deg, #1a1a2e, #2d2d44);
          color: #00ff88;
          padding: 8px 16px 8px 14px;
          font-size: 10px;
          font-weight: 800;
          border-radius: 0 8px 8px 0;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: 1px;
          white-space: nowrap;
          text-transform: uppercase;
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.15);
          border-right: 2px solid rgba(0, 255, 136, 0.3);
        }

        html.dark-mode .ticker-label {
          background: linear-gradient(135deg, #0a0a1a, #1a1a3e);
          color: #00ff88;
          box-shadow: 0 0 30px rgba(0, 255, 136, 0.25);
          border-right-color: rgba(0, 255, 136, 0.5);
        }

        .live-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          background: #00ff88;
          border-radius: 50%;
          animation: live-pulse 1.5s ease-in-out infinite;
          box-shadow: 0 0 8px rgba(0, 255, 136, 0.6);
        }

        @keyframes live-pulse {
          0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 8px rgba(0, 255, 136, 0.6); }
          50% { opacity: 0.5; transform: scale(0.8); box-shadow: 0 0 4px rgba(0, 255, 136, 0.3); }
        }

        .ticker-updated {
          font-size: 8px;
          font-weight: 400;
          opacity: 0.6;
          letter-spacing: 0.3px;
          display: block;
          margin-top: 2px;
        }

        .ticker-wrapper {
          margin-left: 160px;
          overflow: hidden;
          flex: 1;
        }

        .ticker-content {
          display: flex;
          gap: 20px;
          padding: 8px 20px;
          animation: scroll-ticker 50s linear infinite;
          width: max-content;
        }

        .ticker-wrapper:hover .ticker-content {
          animation-play-state: paused;
        }

        @keyframes scroll-ticker {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }

        .ticker-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 10px;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          flex-shrink: 0;
          transition: all 0.3s ease;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          position: relative;
          overflow: hidden;
        }

        .ticker-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.05), transparent);
          transition: left 0.6s ease;
        }

        .ticker-item.flash::before {
          left: 100%;
        }

        .ticker-item.flash {
          border-color: #00ff88;
          box-shadow: 0 0 12px rgba(0, 255, 136, 0.2);
        }

        .ticker-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
          border-color: var(--primary-color);
        }

        html.dark-mode .ticker-item {
          background: var(--card-bg);
          border-color: var(--border-color);
        }

        html.dark-mode .ticker-item:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
          border-color: #00ff88;
        }

        .ticker-icon {
          font-size: 13px;
          display: flex;
          align-items: center;
          color: var(--primary-color);
          opacity: 0.7;
        }

        html.dark-mode .ticker-icon {
          color: #00ff88;
          opacity: 0.8;
        }

        .ticker-symbol {
          font-weight: 700;
          color: var(--text-primary);
          font-size: 11px;
          min-width: 55px;
          letter-spacing: 0.3px;
        }

        html.dark-mode .ticker-symbol {
          color: #e5e7eb;
        }

        .ticker-value {
          color: var(--text-primary);
          font-weight: 700;
          font-size: 12px;
          min-width: 70px;
          font-variant-numeric: tabular-nums;
        }

        html.dark-mode .ticker-value {
          color: #f3f4f6;
        }

        .ticker-change {
          display: flex;
          align-items: center;
          gap: 3px;
          font-weight: 700;
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 5px;
          min-width: 55px;
          justify-content: center;
        }

        .ticker-change.positive {
          color: #00c853;
          background: rgba(0, 200, 83, 0.1);
        }

        .ticker-change.negative {
          color: #ff1744;
          background: rgba(255, 23, 68, 0.1);
        }

        html.dark-mode .ticker-change.positive {
          background: rgba(0, 200, 83, 0.15);
          color: #69f0ae;
        }

        html.dark-mode .ticker-change.negative {
          background: rgba(255, 23, 68, 0.15);
          color: #ff8a80;
        }

        .ticker-market {
          font-size: 7px;
          font-weight: 600;
          color: var(--text-secondary);
          opacity: 0.5;
          letter-spacing: 0.5px;
          margin-left: 2px;
        }

        @media (max-width: 768px) {
          .market-ticker-container { height: 56px; margin-top: 60px; }
          .ticker-label { font-size: 9px; padding: 6px 12px 6px 10px; }
          .ticker-wrapper { margin-left: 130px; }
          .ticker-content { gap: 14px; }
          .ticker-item { font-size: 10px; padding: 4px 10px; }
          .ticker-symbol { min-width: 45px; font-size: 10px; }
          .ticker-value { min-width: 55px; font-size: 11px; }
          .ticker-change { min-width: 45px; font-size: 9px; }
          .ticker-updated { display: none; }
        }

        @media (max-width: 600px) {
          .market-ticker-container { height: 56px; margin-top: 55px; }
        }
      `}</style>

      <div className="ticker-label">
        <span className="live-dot" />
        LIVE MARKET
        {lastUpdated && <span className="ticker-updated">{lastUpdated}</span>}
      </div>

      <div className="ticker-wrapper">
        <div className="ticker-content">
          {[...decorated, ...decorated].map((item, idx) => (
            <div
              key={idx}
              className={`ticker-item ${flashIndices.has(idx % decorated.length) ? 'flash' : ''}`}
              title={`${item.fullName} (${item.market})`}
            >
              <span className="ticker-icon">{item.icon}</span>
              <span className="ticker-symbol">{item.symbol}</span>
              <span className="ticker-value">{formatMarketValue(item.symbol, item.value)}</span>
              <span className={`ticker-change ${item.isPositive ? 'positive' : 'negative'}`}>
                {item.isPositive ? <FaChartLine size={9} /> : <FaArrowDown size={9} />}
                {item.change.toFixed(2)}%
              </span>
              <span className="ticker-market">{item.market}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
