import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { FinanceProvider } from './hooks/useFinance';
import { DarkModeProvider } from './hooks/useDarkMode';
import { MarketDataProvider } from './hooks/useMarketData';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MarketTicker } from './components/MarketTicker';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Dashboard } from './pages/Dashboard';
import { Expenses } from './pages/Expenses';
import { Assets } from './pages/Assets';
import { Income } from './pages/Income';
import { Budget } from './pages/Budget';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Accounts } from './pages/Accounts';
import { Essentials } from './pages/Essentials';
import { Calculators } from './pages/Calculators';
import { Goals } from './pages/Goals';
import './styles/index.css';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState(() => {
    if (typeof window === 'undefined') return 'expanded';
    const stored = window.localStorage.getItem('wellthSidebarMode');
    if (stored === 'expanded' || stored === 'collapsed' || stored === 'hidden') {
      return stored;
    }
    if (window.innerWidth < 768) return 'hidden';
    if (window.innerWidth < 1024) return 'collapsed';
    return 'expanded';
  });

  useEffect(() => {
    window.localStorage.setItem('wellthSidebarMode', sidebarMode);
  }, [sidebarMode]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleSidebarCollapse = () => {
    setSidebarMode((prevMode) => {
      if (prevMode === 'expanded') return 'collapsed';
      if (prevMode === 'collapsed') return 'expanded';
      return window.innerWidth < 1024 ? 'collapsed' : 'expanded';
    });
  };

  const toggleSidebarHidden = () => {
    setSidebarMode((prevMode) => {
      if (prevMode === 'hidden') {
        return window.innerWidth < 1024 ? 'collapsed' : 'expanded';
      }
      return 'hidden';
    });
  };

  return (
    <DarkModeProvider>
    <FinanceProvider>
    <MarketDataProvider>
      <ErrorBoundary>
        <div className="app-container">
          <Navbar
            onMenuToggle={toggleMobileMenu}
            isMobileMenuOpen={isMobileMenuOpen}
            onSidebarCollapseToggle={toggleSidebarCollapse}
            onSidebarHiddenToggle={toggleSidebarHidden}
            sidebarMode={sidebarMode}
          />
          <MarketTicker />
          <div className={`app-body sidebar-${sidebarMode}`}>
            <Sidebar
              sidebarMode={sidebarMode}
              isMobileOpen={isMobileMenuOpen}
              onMobileClose={closeMobileMenu}
            />
            <main className="main-content">
              <div className="main-content-inner">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/expenses" element={<Expenses />} />
                  <Route path="/assets" element={<Assets />} />
                  <Route path="/income" element={<Income />} />
                  <Route path="/budget" element={<Budget />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/accounts" element={<Accounts />} />
                  <Route path="/essentials" element={<Essentials />} />
                  <Route path="/calculators" element={<Calculators />} />
                  <Route path="/goals" element={<Goals />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </ErrorBoundary>
    </MarketDataProvider>
    </FinanceProvider>
    </DarkModeProvider>
  );
}

export default App;
