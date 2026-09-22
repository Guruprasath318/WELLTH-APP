import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (err) {
        console.error('Failed to parse stored user data:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

      setUser(data.user);
      setToken(data.token);

      return data;
    } catch (err) {
      const errorMsg = err.message || 'Login failed';
      setError(errorMsg);
      console.error('Login error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (username, password, confirmPassword) => {
    setLoading(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, confirmPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Signup failed');
      }

      const data = await response.json();

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

      setUser(data.user);
      setToken(data.token);

      return data;
    } catch (err) {
      const errorMsg = err.message || 'Signup failed';
      setError(errorMsg);
      console.error('Signup error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    setError(null);
  };

  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    setLoading(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Password change failed');
      }

      return data;
    } catch (err) {
      setError(err.message || 'Password change failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    signup,
    changePassword,
    logout,
    updateUser,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
