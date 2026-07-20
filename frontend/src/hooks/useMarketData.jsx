import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const items = [
  { symbol: 'SENSEX', key: '^BSESN', icon: 'FaChartLine', fullName: 'S&P BSE Sensex', market: 'INDIA' },
  { symbol: 'NIFTY 50', key: '^NSEI', icon: 'FaChartLine', fullName: 'NIFTY 50', market: 'INDIA' },
  { symbol: 'USD/INR', key: 'USDINR=X', icon: 'FaDollarSign', fullName: 'USD to INR', market: 'FOREX' },
  { symbol: 'DOW JONES', key: '^DJI', icon: 'FaChartLine', fullName: 'Dow Jones Industrial', market: 'US' },
  { symbol: 'NASDAQ', key: '^IXIC', icon: 'FaChartLine', fullName: 'NASDAQ Composite', market: 'US' },
  { symbol: 'S&P 500', key: '^GSPC', icon: 'FaChartLine', fullName: 'S&P 500', market: 'US' },
  { symbol: 'GOLD/10g', key: 'gold', icon: 'FaGem', fullName: 'Gold Rate (10g)', market: 'COMMODITY' },
  { symbol: 'SILVER/kg', key: 'silver', icon: 'FaFire', fullName: 'Silver Rate (1kg)', market: 'COMMODITY' },
  { symbol: 'CRUDE OIL', key: 'crude', icon: 'FaOilCan', fullName: 'Crude Oil (Brent)', market: 'COMMODITY' },
  { symbol: 'BTC/INR', key: 'bitcoin', icon: 'FaBitcoin', fullName: 'Bitcoin', market: 'CRYPTO' },
  { symbol: 'ETH/INR', key: 'ethereum', icon: 'FaEthereum', fullName: 'Ethereum', market: 'CRYPTO' },
];

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

function formatMarketValue(symbol, value) {
  if (symbol === 'BTC/INR') return `₹${(value / 100000).toFixed(1)}L`;
  if (symbol === 'ETH/INR') return `₹${(value / 1000).toFixed(1)}K`;
  if (symbol === 'GOLD/10g' || symbol === 'SILVER/kg') return value.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  if (symbol === 'USD/INR' || symbol === 'CRUDE OIL') return value.toFixed(2);
  return value.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

const MarketDataContext = createContext(null);

export function MarketDataProvider({ children }) {
  const [marketData, setMarketData] = useState(() =>
    items.map(item => {
      const bases = seededBase();
      return { ...item, value: bases[item.key], change: 0, isPositive: true };
    })
  );
  const [lastUpdated, setLastUpdated] = useState(null);
  const prevValuesRef = useRef({});

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
        } catch {
          return null;
        }
      });

      const results = await Promise.allSettled(promises);
      const updates = {};
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value) {
          updates[r.value.key] = r.value;
        }
      }

      setMarketData(prev => {
        const prevValues = {};
        const next = prev.map(item => {
          const live = updates[item.key];
          if (live) {
            prevValues[item.symbol] = live.value;
            return { ...item, value: live.value, change: live.change, isPositive: live.change >= 0 };
          }
          const driftVal = 1 + (Math.random() - 0.5) * 0.003;
          const newVal = item.value * driftVal;
          const chg = ((newVal - item.value) / item.value) * 100;
          prevValues[item.symbol] = newVal;
          return { ...item, value: newVal, change: chg, isPositive: chg >= 0 };
        });
        prevValuesRef.current = prevValues;
        return next;
      });

      setLastUpdated(new Date().toLocaleTimeString('en-IN'));
    } catch {
      drift();
    }
  }, []);

  const drift = useCallback(() => {
    setMarketData(prev => {
      const prevValues = {};
      const next = prev.map(item => {
        const driftVal = 1 + (Math.random() - 0.5) * 0.003;
        const newVal = item.value * driftVal;
        const chg = ((newVal - item.value) / item.value) * 100;
        prevValues[item.symbol] = newVal;
        return { ...item, value: newVal, change: chg, isPositive: chg >= 0 };
      });
      prevValuesRef.current = prevValues;
      return next;
    });
    setLastUpdated(new Date().toLocaleTimeString('en-IN'));
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 45000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <MarketDataContext.Provider value={{ marketData, items, lastUpdated, formatMarketValue }}>
      {children}
    </MarketDataContext.Provider>
  );
}

export function useMarketData() {
  const context = useContext(MarketDataContext);
  if (!context) {
    throw new Error('useMarketData must be used within MarketDataProvider');
  }
  return context;
}
