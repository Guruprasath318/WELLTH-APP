import express from 'express';
import { getDatabase } from './database.js';
import { authenticateToken } from './authRoutes.js';
import { body, param, validationResult } from 'express-validator';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all data for authenticated user
router.get('/data', async (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const [expenses, income, assets, accounts, budgets, profile] = await Promise.all([
      db.all('SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC', [userId]),
      db.all('SELECT * FROM income WHERE user_id = ? ORDER BY date DESC', [userId]),
      db.all('SELECT * FROM assets WHERE user_id = ?', [userId]),
      db.all('SELECT * FROM accounts WHERE user_id = ?', [userId]),
      db.all('SELECT * FROM budgets WHERE user_id = ?', [userId]),
      db.get('SELECT * FROM profile WHERE user_id = ?', [userId])
    ]);

    res.json({
      expenses: expenses || [],
      income: income || [],
      assets: assets || [],
      accounts: accounts || [],
      budgets: budgets || [],
      profile: profile || { age: 0, total_income: 0, total_expenses: 0, total_savings: 0 }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add expense
router.post('/expenses',
  [
    body('description').isString().trim().notEmpty().withMessage('Description is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
    body('category').optional().isString(),
    body('date').optional().isISO8601()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const { description, amount, category, date } = req.body;

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({ error: 'Description is required' });
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    const result = await db.run(
      'INSERT INTO expenses (user_id, description, amount, category, date) VALUES (?, ?, ?, ?, ?)',
      [userId, description.trim(), parsedAmount, category || 'Other', date || new Date().toISOString().split('T')[0]]
    );

    res.json({ id: result.lastID, description: description.trim(), amount: parsedAmount, category: category || 'Other', date: date || new Date().toISOString().split('T')[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update expense
router.put('/expenses/:id',
  [
    param('id').isInt().withMessage('Invalid expense id'),
    body('description').isString().trim().notEmpty().withMessage('Description is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
    body('category').optional().isString(),
    body('date').optional().isISO8601()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const { id } = req.params;
    const { description, amount, category, date } = req.body;

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({ error: 'Description is required' });
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    const existing = await db.get('SELECT id FROM expenses WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    await db.run(
      'UPDATE expenses SET description = ?, amount = ?, category = ?, date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [description.trim(), parsedAmount, category || 'Other', date, id, userId]
    );

    res.json({ id: parseInt(id), description: description.trim(), amount: parsedAmount, category, date });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete expense
router.delete('/expenses/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const { id } = req.params;

    const existing = await db.get('SELECT id FROM expenses WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    await db.run('DELETE FROM expenses WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add income
router.post('/income',
  [
    body('description').isString().trim().notEmpty().withMessage('Description is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
    body('source').optional().isString(),
    body('date').optional().isISO8601()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const { description, amount, source, date } = req.body;

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({ error: 'Description is required' });
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    const result = await db.run(
      'INSERT INTO income (user_id, description, amount, source, date) VALUES (?, ?, ?, ?, ?)',
      [userId, description.trim(), parsedAmount, source || 'Other', date || new Date().toISOString().split('T')[0]]
    );

    res.json({ id: result.lastID, description: description.trim(), amount: parsedAmount, source: source || 'Other', date: date || new Date().toISOString().split('T')[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update income
router.put('/income/:id',
  [
    param('id').isInt().withMessage('Invalid income id'),
    body('description').isString().trim().notEmpty().withMessage('Description is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
    body('source').optional().isString(),
    body('date').optional().isISO8601()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const { id } = req.params;
    const { description, amount, source, date } = req.body;

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({ error: 'Description is required' });
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    const existing = await db.get('SELECT id FROM income WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing) {
      return res.status(404).json({ error: 'Income not found' });
    }

    await db.run(
      'UPDATE income SET description = ?, amount = ?, source = ?, date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [description.trim(), parsedAmount, source, date, id, userId]
    );

    res.json({ id: parseInt(id), description: description.trim(), amount: parsedAmount, source, date });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete income
router.delete('/income/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const { id } = req.params;

    const existing = await db.get('SELECT id FROM income WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing) {
      return res.status(404).json({ error: 'Income not found' });
    }

    await db.run('DELETE FROM income WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add asset
router.post('/assets',
  [
    body('name').isString().trim().notEmpty().withMessage('Asset name is required'),
    body('type').optional().isString(),
    body('value').isFloat({ min: 0 }).withMessage('Value must be a non-negative number'),
    body('description').optional().isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const { name, type, value, description } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Asset name is required' });
    }
    const parsedValue = parseFloat(value);
    if (isNaN(parsedValue) || parsedValue < 0) {
      return res.status(400).json({ error: 'Value must be a non-negative number' });
    }

    const result = await db.run(
      'INSERT INTO assets (user_id, name, type, value, description) VALUES (?, ?, ?, ?, ?)',
      [userId, name.trim(), type || 'Other', parsedValue, description || '']
    );

    res.json({ id: result.lastID, name: name.trim(), type: type || 'Other', value: parsedValue, description: description || '' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update asset
router.put('/assets/:id',
  [
    param('id').isInt().withMessage('Invalid asset id'),
    body('name').isString().trim().notEmpty().withMessage('Asset name is required'),
    body('type').optional().isString(),
    body('value').isFloat({ min: 0 }).withMessage('Value must be a non-negative number'),
    body('description').optional().isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const { id } = req.params;
    const { name, type, value, description } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Asset name is required' });
    }
    const parsedValue = parseFloat(value);
    if (isNaN(parsedValue) || parsedValue < 0) {
      return res.status(400).json({ error: 'Value must be a non-negative number' });
    }

    const existing = await db.get('SELECT id FROM assets WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    await db.run(
      'UPDATE assets SET name = ?, type = ?, value = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [name.trim(), type, parsedValue, description, id, userId]
    );

    res.json({ id: parseInt(id), name: name.trim(), type, value: parsedValue, description });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete asset
router.delete('/assets/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const { id } = req.params;

    const existing = await db.get('SELECT id FROM assets WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    await db.run('DELETE FROM assets WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add account
router.post('/accounts',
  [
    body('name').isString().trim().notEmpty().withMessage('Account name is required'),
    body('type').optional().isString(),
    body('balance').isFloat().withMessage('Balance must be a number'),
    body('bank').optional().isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const { name, type, balance, bank } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Account name is required' });
    }
    const parsedBalance = parseFloat(balance);
    if (isNaN(parsedBalance)) {
      return res.status(400).json({ error: 'Balance must be a number' });
    }

    const result = await db.run(
      'INSERT INTO accounts (user_id, name, type, balance, bank) VALUES (?, ?, ?, ?, ?)',
      [userId, name.trim(), type || 'Bank Account', parsedBalance, bank || '']
    );

    res.json({ id: result.lastID, name: name.trim(), type: type || 'Bank Account', balance: parsedBalance, bank: bank || '' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update account
router.put('/accounts/:id',
  [
    param('id').isInt().withMessage('Invalid account id'),
    body('name').isString().trim().notEmpty().withMessage('Account name is required'),
    body('type').optional().isString(),
    body('balance').isFloat().withMessage('Balance must be a number'),
    body('bank').optional().isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const { id } = req.params;
    const { name, type, balance, bank } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Account name is required' });
    }
    const parsedBalance = parseFloat(balance);
    if (isNaN(parsedBalance)) {
      return res.status(400).json({ error: 'Balance must be a number' });
    }

    const existing = await db.get('SELECT id FROM accounts WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing) {
      return res.status(404).json({ error: 'Account not found' });
    }

    await db.run(
      'UPDATE accounts SET name = ?, type = ?, balance = ?, bank = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [name.trim(), type, parsedBalance, bank, id, userId]
    );

    res.json({ id: parseInt(id), name: name.trim(), type, balance: parsedBalance, bank });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete account
router.delete('/accounts/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const { id } = req.params;

    const existing = await db.get('SELECT id FROM accounts WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing) {
      return res.status(404).json({ error: 'Account not found' });
    }

    await db.run('DELETE FROM accounts WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add budget
router.post('/budgets',
  [
    body('category').isString().trim().notEmpty().withMessage('Category is required'),
    body('limit').isFloat({ gt: 0 }).withMessage('Budget limit must be a positive number'),
    body('month').optional().isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const { category, limit, month } = req.body;

    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      return res.status(400).json({ error: 'Category is required' });
    }
    const parsedLimit = parseFloat(limit);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      return res.status(400).json({ error: 'Budget limit must be a positive number' });
    }

    const result = await db.run(
      'INSERT INTO budgets (user_id, category, "limit", month) VALUES (?, ?, ?, ?)',
      [userId, category.trim(), parsedLimit, month || new Date().toISOString().slice(0, 7)]
    );

    res.json({ id: result.lastID, category: category.trim(), limit: parsedLimit, spent: 0, month: month || new Date().toISOString().slice(0, 7) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update budget
router.put('/budgets/:id',
  [
    param('id').isInt().withMessage('Invalid budget id'),
    body('category').optional().isString(),
    body('limit').optional().isFloat({ gt: 0 }),
    body('spent').optional().isFloat({ min: 0 }),
    body('month').optional().isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const { id } = req.params;
    const { category, limit, spent, month } = req.body;

    const existing = await db.get('SELECT id FROM budgets WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    await db.run(
      'UPDATE budgets SET category = ?, "limit" = ?, spent = ?, month = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [category, limit, spent || 0, month, id, userId]
    );

    res.json({ id: parseInt(id), category, limit, spent: spent || 0, month });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete budget
router.delete('/budgets/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const { id } = req.params;

    const existing = await db.get('SELECT id FROM budgets WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    await db.run('DELETE FROM budgets WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update profile
router.put('/profile',
  [
    body('username').optional().trim().matches(/^[a-zA-Z0-9._-]+$/).isLength({ min: 3, max: 32 }),
    body('age').optional().isInt({ min: 0 }),
    body('date_of_birth').optional().isISO8601().withMessage('Date of birth must be a valid date'),
    body('total_income').optional().isFloat({ min: 0 }),
    body('total_expenses').optional().isFloat({ min: 0 }),
    body('total_savings').optional().isFloat({ min: 0 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const { username, age, date_of_birth, total_income, total_expenses, total_savings } = req.body;

    if (username) {
      const existingUser = await db.get('SELECT id FROM users WHERE LOWER(username) = LOWER(?) AND id != ?', [username.trim(), userId]);
      if (existingUser) {
        return res.status(409).json({ error: 'That username is already taken' });
      }
      await db.run('UPDATE users SET username = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [username.trim(), userId]);
    }

    let profile = await db.get('SELECT id FROM profile WHERE user_id = ?', [userId]);

    if (profile) {
      await db.run(
        'UPDATE profile SET age = ?, date_of_birth = ?, total_income = ?, total_expenses = ?, total_savings = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [age || 0, date_of_birth || null, total_income || 0, total_expenses || 0, total_savings || 0, userId]
      );
    } else {
      await db.run(
        'INSERT INTO profile (user_id, age, date_of_birth, total_income, total_expenses, total_savings) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, age || 0, date_of_birth || null, total_income || 0, total_expenses || 0, total_savings || 0]
      );
    }

    res.json({ username, age: age || 0, date_of_birth: date_of_birth || null, total_income: total_income || 0, total_expenses: total_expenses || 0, total_savings: total_savings || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;