import { Routes, Route } from 'react-router-dom';
import { FinanceProvider } from './hooks/useFinance';
import { DarkModeProvider } from './hooks/useDarkMode';
import { MarketDataProvider } from './hooks/useMarketData';
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
import Layout from './components/Layout';

function App() {
  return (
    <DarkModeProvider>
      <FinanceProvider>
        <MarketDataProvider>
          <ErrorBoundary>
            <Layout>
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
            </Layout>
          </ErrorBoundary>
        </MarketDataProvider>
      </FinanceProvider>
    </DarkModeProvider>
  );
}

export default App;
