import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './hooks/useAuth';
import AppWrapper from './AppWrapper.jsx'

try {
  const root = ReactDOM.createRoot(document.getElementById('root'))
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <AppWrapper />
      </AuthProvider>
    </React.StrictMode>,
  )
} catch (error) {
  document.getElementById('root').innerHTML = `<div style="color: red; padding: 20px;"><h1>Error: ${error.message}</h1><pre>${error.stack}</pre></div>`;
}
