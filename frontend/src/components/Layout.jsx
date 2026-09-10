import { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MarketTicker } from './MarketTicker';

export function Layout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sidebarMode = 'expanded';

  useEffect(() => {
    document.body.classList.toggle('drawer-open', isMobileMenuOpen);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setIsMobileMenuOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    document.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen((v) => !v);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="app-container">
      <Navbar
        onMenuToggle={toggleMobileMenu}
        isMobileMenuOpen={isMobileMenuOpen}
        sidebarMode={sidebarMode}
      />
      <MarketTicker />

      <div className={`app-body sidebar-${sidebarMode}`}>
        <Sidebar
          sidebarMode={sidebarMode}
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={closeMobileMenu}
        />

        <main className="main-content" tabIndex={-1} aria-live="polite">
          <div className="main-content-inner">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
