import { Link, useLocation } from 'react-router-dom';
import {
  FaHouse, FaArrowUp, FaArrowDown, FaChartPie,
  FaFileLines, FaCreditCard, FaPercent, FaBullseye, FaCircleCheck, FaGear, FaWallet
} from 'react-icons/fa6';
import { useMarketData } from '../hooks/useMarketData';

export function Sidebar({ sidebarMode = 'expanded', isMobileOpen, onMobileClose }) {
  const location = useLocation();
  const { marketData, formatMarketValue } = useMarketData();
  const isMobileDrawerOpen = !!isMobileOpen;
  const isHidden = sidebarMode === 'hidden' && !isMobileOpen;

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: FaHouse },
    { path: '/assets', label: 'Wealth', icon: FaWallet },
    { path: '/budget', label: 'Money', icon: FaChartPie },
    { path: '/essentials', label: 'Essentials', icon: FaCircleCheck },
    { path: '/accounts', label: 'Accounts', icon: FaCreditCard },
    { path: '/income', label: 'Income', icon: FaArrowUp },
    { path: '/expenses', label: 'Expenses', icon: FaArrowDown },
    { path: '/reports', label: 'Reports', icon: FaFileLines },
    { path: '/settings', label: 'Settings', icon: FaGear },
  ];

  return (
    <>
      {isMobileDrawerOpen && <div className="sidebar-overlay" onClick={onMobileClose} role="presentation" />}
      <aside
        id="primary-navigation"
        className={`sidebar ${sidebarMode} ${isHidden ? 'hidden' : ''} ${isMobileDrawerOpen ? 'open mobile-open' : ''}`}
        aria-label="Primary navigation"
        aria-hidden={isHidden}
        role="navigation"
      >
        <div className="sidebar-nav" tabIndex={0} aria-label="Sidebar navigation">
          {menuItems.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.path ||
              (item.path === '/' && location.pathname === '/dashboard');

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={`sidebar-link ${active ? 'active' : ''}`}
                aria-label={item.label}
                data-tooltip={item.label}
              >
                <span className="sidebar-icon"><Icon /></span>
                <span className="sidebar-label">{item.label}</span>
              </Link>
            );
          })}

          <div className="sidebar-section-title">TOOLS</div>

          <Link to="/calculators" onClick={onMobileClose} className={`sidebar-link ${location.pathname === '/calculators' ? 'active' : ''}`}>
            <span className="sidebar-icon"><FaPercent /></span>
            <span className="sidebar-label">Calculators</span>
          </Link>

          <Link to="/goals" onClick={onMobileClose} className={`sidebar-link ${location.pathname === '/goals' ? 'active' : ''}`}>
            <span className="sidebar-icon"><FaBullseye /></span>
            <span className="sidebar-label">Goals</span>
          </Link>

          <div className="sidebar-market-section">
            <div className="sidebar-market-header">
              <span className="sidebar-live-dot" />
              Market updates
            </div>
            {marketData.slice(0, 5).map(item => (
              <div key={item.symbol} className="sidebar-market-item">
                <span className="sidebar-market-symbol">{item.symbol}</span>
                <span className="sidebar-market-value">{formatMarketValue(item.symbol, item.value)}</span>
                <span className={`sidebar-market-change ${item.isPositive ? 'positive' : 'negative'}`}>
                  {item.isPositive ? '+' : ''}{item.change.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>

      </aside>
    </>
  );
}
