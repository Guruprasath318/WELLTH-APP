import { Link, useLocation } from 'react-router-dom';
import {
  FaHouse, FaArrowUp, FaArrowDown, FaChartLine, FaChartPie,
  FaFileLines, FaCreditCard, FaPercent, FaBullseye, FaCircleCheck, FaGear
} from 'react-icons/fa6';
import { useMarketData } from '../hooks/useMarketData';

export function Sidebar({ sidebarMode = 'expanded', isMobileOpen, onMobileClose }) {
  const location = useLocation();
  const { marketData, formatMarketValue } = useMarketData();
  const isMobileDrawerOpen = isMobileOpen;
  const effectiveSidebarMode = isMobileDrawerOpen ? 'expanded' : sidebarMode;
  const isCollapsed = effectiveSidebarMode === 'collapsed';
  const isHidden = sidebarMode === 'hidden' && !isMobileOpen;

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: FaHouse },
    { path: '/income', label: 'Income', icon: FaArrowUp },
    { path: '/expenses', label: 'Expenses', icon: FaArrowDown },
    { path: '/assets', label: 'Assets', icon: FaChartLine },
    { path: '/budget', label: 'Budget', icon: FaChartPie },
    { path: '/accounts', label: 'Accounts', icon: FaCreditCard },
    { path: '/goals', label: 'Goals', icon: FaBullseye },
    { path: '/calculators', label: 'Calculators', icon: FaPercent },
    { path: '/reports', label: 'Reports', icon: FaFileLines },
    { path: '/essentials', label: 'Essentials', icon: FaCircleCheck },
    { path: '/settings', label: 'Settings', icon: FaGear },
  ];

  return (
    <>
      {isMobileOpen && <div className="sidebar-overlay" onClick={onMobileClose} />}
      <aside
        id="primary-navigation"
        className={`sidebar ${sidebarMode} ${isMobileOpen ? 'open mobile-open' : ''}`}
        aria-label="Primary navigation"
        aria-hidden={isHidden}
      >
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/Wellth.jpg" alt="WELLTH" />
          </div>
          <div>
            <h3>WELLTH</h3>
            <p>Smarter finance control</p>
          </div>
          <span className="sidebar-badge">Live</span>
        </div>

        <div className="sidebar-nav">
          {menuItems.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={`sidebar-link ${active ? 'active' : ''}`}
                title={isCollapsed ? item.label : undefined}
                aria-label={item.label}
                data-tooltip={item.label}
              >
                <span className="sidebar-icon"><Icon /></span>
                <span className="sidebar-label">{item.label}</span>
              </Link>
            );
          })}

          <div className="sidebar-market-section">
            <div className="sidebar-market-header">
              <span className="sidebar-live-dot" />
              MARKET UPDATES
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

        <div className="sidebar-footer">
          <span>WELLTH v1.0</span>
        </div>
      </aside>
    </>
  );
}
