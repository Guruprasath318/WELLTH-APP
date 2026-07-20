/**
 * Finance Tracker - API Storage Service
 * Handles all backend API calls to the database
 */

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const defaultData = {
  expenses: [],
  assets: [],
  income: [],
  incomes: [],
  accounts: [],
  budgets: [],
  recurringExpenses: [],
  goals: [],
  profile: {
    age: 0,
    total_income: 0,
    total_expenses: 0,
    total_savings: 0
  }
};

// Local Storage Functions
export function getFromStorage() {
  try {
    const stored = localStorage.getItem('financeData');
    if (!stored) return defaultData;
    
    const parsed = JSON.parse(stored);
    // Ensure all properties are initialized to prevent crashes
    return {
      ...defaultData,
      ...parsed,
      expenses: parsed.expenses || [],
      assets: parsed.assets || [],
      income: parsed.income || [],
      incomes: parsed.incomes || parsed.income || [],
      accounts: parsed.accounts || [],
      budgets: parsed.budgets || [],
      recurringExpenses: parsed.recurringExpenses || [],
      goals: parsed.goals || [],
      profile: { ...defaultData.profile, ...(parsed.profile || {}) }
    };
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultData;
  }
}

export function saveToStorage(data) {
  try {
    localStorage.setItem('financeData', JSON.stringify(data));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
}

// Helper function for API calls
async function apiCall(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Include auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

// Fetch all data
export async function fetchAllData() {
  return await apiCall('/data');
}

// Expenses
export async function addExpense(expense) {
  return await apiCall('/expenses', 'POST', expense);
}

export async function updateExpense(id, expense) {
  return await apiCall(`/expenses/${id}`, 'PUT', expense);
}

export async function deleteExpense(id) {
  return await apiCall(`/expenses/${id}`, 'DELETE');
}

// Income
export async function addIncome(income) {
  return await apiCall('/income', 'POST', income);
}

export async function updateIncome(id, income) {
  return await apiCall(`/income/${id}`, 'PUT', income);
}

export async function deleteIncome(id) {
  return await apiCall(`/income/${id}`, 'DELETE');
}

// Assets
export async function addAsset(asset) {
  return await apiCall('/assets', 'POST', asset);
}

export async function updateAsset(id, asset) {
  return await apiCall(`/assets/${id}`, 'PUT', asset);
}

export async function deleteAsset(id) {
  return await apiCall(`/assets/${id}`, 'DELETE');
}

// Accounts
export async function addAccount(account) {
  return await apiCall('/accounts', 'POST', account);
}

export async function updateAccount(id, account) {
  return await apiCall(`/accounts/${id}`, 'PUT', account);
}

export async function deleteAccount(id) {
  return await apiCall(`/accounts/${id}`, 'DELETE');
}

// Budgets
export async function addBudget(budget) {
  return await apiCall('/budgets', 'POST', budget);
}

export async function updateBudget(id, budget) {
  return await apiCall(`/budgets/${id}`, 'PUT', budget);
}

export async function deleteBudget(id) {
  return await apiCall(`/budgets/${id}`, 'DELETE');
}

// Profile
export async function updateProfile(profile) {
  return await apiCall('/profile', 'PUT', profile);
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function calculateTotalExpenses(expenses) {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

export function calculateTotalAssets(assets) {
  return assets.reduce((sum, asset) => sum + asset.value, 0);
}

export function calculateNetWorth(totalAssets, totalExpenses) {
  return totalAssets - totalExpenses;
}

export function calculateSavingsRate(income, expenses) {
  if (income === 0) return 0;
  const savings = income - expenses;
  return (savings / income) * 100;
}

export function getSavingsStatus(savingsRate) {
  if (savingsRate >= 30) return 'Excellent';
  if (savingsRate >= 10) return 'Average';
  return 'Poor';
}

export function getCurrentMonthExpenses(expenses) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  return expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === currentYear &&
             expenseDate.getMonth() === currentMonth;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);
}
