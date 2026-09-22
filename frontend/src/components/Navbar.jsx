import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '../hooks/useFinance';
import { useAuth } from '../hooks/useAuth';
import { useDarkMode } from '../hooks/useDarkMode';
import { FaMoon, FaSun, FaUser, FaRightFromBracket, FaGear, FaBars, FaXmark } from 'react-icons/fa6';

export function Navbar({ onMenuToggle = () => {}, isMobileMenuOpen = false, sidebarMode = 'expanded' }) {
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
          <span className="navbar-title">WELLTH APP</span>
        </div>
      </div>

      <div className="navbar-right">
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
