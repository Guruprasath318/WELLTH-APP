import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '../hooks/useFinance';
import { useAuth } from '../hooks/useAuth';
import { useDarkMode } from '../hooks/useDarkMode';
import { FaMoon, FaSun, FaUser, FaRightFromBracket, FaGear, FaBars, FaXmark, FaCompress, FaExpand, FaEyeSlash } from 'react-icons/fa6';

export function Navbar({ onMenuToggle = () => {}, isMobileMenuOpen = false, onSidebarCollapseToggle = () => {}, onSidebarHiddenToggle = () => {}, sidebarMode = 'expanded' }) {
  const navigate = useNavigate();
  const finance = useFinance();
  const data = finance?.data;
  const { logout, user } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();

  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSettings = () => {
    setShowProfile(false);
    navigate('/settings');
  };

  const collapseLabel = sidebarMode === 'collapsed' ? 'Expand sidebar' : 'Collapse sidebar';
  const hideLabel = sidebarMode === 'hidden' ? 'Show sidebar' : 'Hide sidebar';

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button
          type="button"
          className="navbar-menu-toggle"
          onClick={onMenuToggle}
          aria-controls="primary-navigation"
          aria-label={isMobileMenuOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <FaXmark size={20} /> : <FaBars size={20} />}
        </button>

        <div className="navbar-brand">
          <img src="/Wellth.jpg" alt="WELLTH Logo" className="navbar-logo" />
          <div>
            <span className="navbar-title">WELLTH APP</span>
            <div className="navbar-subtitle">Daily finance clarity</div>
          </div>
        </div>
      </div>

      <div className="navbar-right">
        <button
          type="button"
          className="navbar-btn"
          onClick={onSidebarCollapseToggle}
          aria-controls="primary-navigation"
          aria-pressed={sidebarMode === 'collapsed'}
          aria-label={collapseLabel}
          title={collapseLabel}
        >
          {sidebarMode === 'collapsed' ? <FaExpand size={18} /> : <FaCompress size={18} />}
        </button>

        <button
          type="button"
          className="navbar-btn hide-sidebar-btn"
          onClick={onSidebarHiddenToggle}
          aria-controls="primary-navigation"
          aria-pressed={sidebarMode === 'hidden'}
          aria-label={hideLabel}
          title={hideLabel}
        >
          {sidebarMode === 'hidden' ? <FaBars size={18} /> : <FaEyeSlash size={18} />}
        </button>

        <button className="navbar-btn" onClick={toggleDarkMode} aria-label="Toggle Dark Mode" title="Toggle Dark Mode">
          {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
        </button>

        <div className="navbar-profile" ref={profileRef}>
          <button className="navbar-btn profile-btn" onClick={() => setShowProfile(!showProfile)}>
            <FaUser size={18} />
            <span className="profile-name">{user?.username || 'Profile'}</span>
          </button>

          {showProfile && (
            <div className="profile-dropdown">
              <div className="profile-info">
                <div className="profile-avatar">{user?.username?.charAt(0)?.toUpperCase()}</div>
                <h3>{user?.username || 'User'}</h3>
                <p>{user?.email || 'Email not available'}</p>

                <div className="profile-meta">
                  <span>Age: {data?.profile?.age || 'Not set'}</span>
                  <span className="status-active">Active</span>
                </div>

                <button className="profile-link" onClick={handleSettings}>
                  <FaGear size={14} /> Settings
                </button>

                <button className="profile-link danger" onClick={handleLogout}>
                  <FaRightFromBracket size={14} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
