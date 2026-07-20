import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import App from './App.jsx';
import Login from './pages/Login';

function AppWrapper() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #3498db 0%, #2c3e50 100%)',
        animation: 'fadeIn 0.5s ease-in'
      }}>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .loader-spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{ color: 'white', textAlign: 'center' }}>
          <div className="loader-spinner"></div>
          <h1>Loading...</h1>
          <p>Please wait while we initialize WELLTH APP</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {isAuthenticated ? <App /> : <Login />}
    </Router>
  );
}

export default AppWrapper;
