import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  createUser,
  findUserByIdentifier,
  comparePassword,
  hashPassword,
  generateJWT,
  verifyJWT,
  getUserData
} from './auth.js';
import { getDatabase } from './database.js';

const router = express.Router();

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const user = verifyJWT(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

router.post('/signup',
  [
    body('username').isString().trim().matches(/^[a-zA-Z0-9._-]+$/).isLength({ min: 3, max: 32 }).withMessage('Username must be 3-32 letters, numbers, dots, underscores, or hyphens'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirmPassword').exists().withMessage('Please confirm your password')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  try {
    const { username, password, confirmPassword } = req.body;
    const normalizedUsername = (username || '').trim();

    if (!normalizedUsername || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Username, password, and confirmation are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await createUser(normalizedUsername, null, password);
    const token = generateJWT(user);
    const userData = await getUserData(user.id);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        ...userData
      },
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/login',
  [
    body('username').isString().trim().isLength({ min: 3, max: 32 }).withMessage('Username is required'),
    body('password').isString().withMessage('Password is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  try {
    const { username, password } = req.body;
    const identifier = (username || '').trim();

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await findUserByIdentifier(identifier);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = generateJWT(user);
    const userData = await getUserData(user.id);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        ...userData
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const db = getDatabase();
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = await getUserData(user.id);

    res.json({
      user: {
        ...user,
        ...userData
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/logout', authenticateToken, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

router.post('/change-password', [
  body('currentPassword').isString().notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  body('confirmPassword').isString().withMessage('Please confirm your new password')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }

    const db = getDatabase();
    const user = await db.get('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    const isCurrentPasswordValid = user && await comparePassword(currentPassword, user.password_hash);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const passwordHash = await hashPassword(newPassword);
    await db.run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [passwordHash, req.user.id]);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
