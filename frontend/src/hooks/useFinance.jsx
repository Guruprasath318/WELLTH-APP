import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { getFromStorage, saveToStorage, defaultData } from '../utils/storage';

const FinanceContext = createContext();

export function FinanceProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try loading from localStorage first for fast initial render
    const initialData = getFromStorage();
    setData(initialData);
    setLoading(false);

    // Then try fetching from backend API if authenticated
    const fetchFromAPI = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('/api/data', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const apiData = await response.json();
          // Merge API data with localStorage data (API takes precedence)
          const merged = {
            ...initialData,
            ...apiData,
            incomes: apiData.income || apiData.incomes || initialData.incomes || [],
            income: apiData.income || initialData.income || [],
            profile: { ...defaultData.profile, ...initialData.profile, ...apiData.profile }
          };
          setData(merged);
          saveToStorage(merged);
        }
      } catch (err) {
        console.warn('Could not fetch from API, using localStorage data:', err.message);
      }
    };

    fetchFromAPI();
  }, []);

  const updateData = useCallback((newData) => {
    setData(newData);
    saveToStorage(newData);
  }, []);

  const addExpense = useCallback(async (expense) => {
    const token = localStorage.getItem('token');
    let savedExpense = { id: Date.now(), ...expense };

    if (token) {
      try {
        const response = await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(expense)
        });
        if (response.ok) {
          savedExpense = await response.json();
        }
      } catch (err) {
        console.warn('API addExpense failed, falling back to localStorage:', err.message);
      }
    }

    setData(prev => {
      const updated = {
        ...prev,
        expenses: [...(prev.expenses || []), savedExpense]
      };
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const addAsset = useCallback(async (asset) => {
    const token = localStorage.getItem('token');
    let savedAsset = { id: Date.now(), ...asset };

    if (token) {
      try {
        const response = await fetch('/api/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(asset)
        });
        if (response.ok) {
          savedAsset = await response.json();
        }
      } catch (err) {
        console.warn('API addAsset failed, falling back to localStorage:', err.message);
      }
    }

    setData(prev => {
      const updated = {
        ...prev,
        assets: [...(prev.assets || []), savedAsset]
      };
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const addIncome = useCallback(async (income) => {
    const token = localStorage.getItem('token');
    let savedIncome = { id: Date.now(), ...income };

    if (token) {
      try {
        const response = await fetch('/api/income', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(income)
        });
        if (response.ok) {
          savedIncome = await response.json();
        }
      } catch (err) {
        console.warn('API addIncome failed, falling back to localStorage:', err.message);
      }
    }

    setData(prev => {
      const updated = {
        ...prev,
        incomes: [...(prev.incomes || []), savedIncome]
      };
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const addBudget = useCallback(async (budget) => {
    const token = localStorage.getItem('token');
    let savedBudget = { id: Date.now(), ...budget };

    if (token) {
      try {
        const response = await fetch('/api/budgets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(budget)
        });
        if (response.ok) {
          savedBudget = await response.json();
        }
      } catch (err) {
        console.warn('API addBudget failed, falling back to localStorage:', err.message);
      }
    }

    setData(prev => {
      const updated = {
        ...prev,
        budgets: [...(prev.budgets || []), savedBudget]
      };
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const addAccount = useCallback(async (account) => {
    const token = localStorage.getItem('token');
    let savedAccount = { id: Date.now(), ...account };

    if (token) {
      try {
        const response = await fetch('/api/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(account)
        });
        if (response.ok) {
          savedAccount = await response.json();
        }
      } catch (err) {
        console.warn('API addAccount failed, falling back to localStorage:', err.message);
      }
    }

    setData(prev => {
      const updated = {
        ...prev,
        accounts: [...(prev.accounts || []), savedAccount]
      };
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const deleteExpense = useCallback(async (id) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch(`/api/expenses/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {
        console.warn('API deleteExpense failed:', err.message);
      }
    }

    setData(prev => {
      const updated = {
        ...prev,
        expenses: (prev.expenses || []).filter(e => e.id !== id)
      };
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const deleteAsset = useCallback(async (id) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch(`/api/assets/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {
        console.warn('API deleteAsset failed:', err.message);
      }
    }

    setData(prev => {
      const updated = {
        ...prev,
        assets: (prev.assets || []).filter(a => a.id !== id)
      };
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const deleteIncome = useCallback(async (id) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch(`/api/income/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {
        console.warn('API deleteIncome failed:', err.message);
      }
    }

    setData(prev => {
      const updated = {
        ...prev,
        incomes: (prev.incomes || []).filter(i => i.id !== id)
      };
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const updateIncome = useCallback(async (id, incomeData) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch(`/api/income/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(incomeData)
        });
      } catch (err) {
        console.warn('API updateIncome failed:', err.message);
      }
    }

    setData(prev => {
      const updated = {
        ...prev,
        incomes: (prev.incomes || []).map(i => i.id === id ? { ...i, ...incomeData } : i)
      };
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const updateProfile = useCallback(async (profile) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(profile)
        });
      } catch (err) {
        console.warn('API updateProfile failed:', err.message);
      }
    }

    setData(prev => {
      const updated = {
        ...prev,
        profile: { ...(prev.profile || {}), ...profile }
      };
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const addGoal = useCallback((goal) => {
    setData(prev => {
      const updated = {
        ...prev,
        goals: [...(prev.goals || []), { id: Date.now(), ...goal }]
      };
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const deleteGoal = useCallback((id) => {
    setData(prev => {
      const updated = {
        ...prev,
        goals: (prev.goals || []).filter(g => g.id !== id)
      };
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const updateGoal = useCallback((id, goalData) => {
    setData(prev => {
      const updated = {
        ...prev,
        goals: (prev.goals || []).map(g => g.id === id ? { ...g, ...goalData } : g)
      };
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const value = {
    data,
    loading,
    updateData,
    addExpense,
    addAsset,
    addIncome,
    addBudget,
    addAccount,
    deleteExpense,
    deleteAsset,
    deleteIncome,
    updateIncome,
    updateProfile,
    addGoal,
    deleteGoal,
    updateGoal
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within FinanceProvider');
  }
  return context;
}