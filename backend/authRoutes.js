import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  createUser,
  findUserByIdentifier,
  comparePassword,
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
    body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirmPassword').exists().withMessage('Please confirm your password')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  try {
    const { username, email, password, confirmPassword, displayName } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();
    const normalizedUsername = (username || displayName || '').trim();

    if (!normalizedEmail || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Email, password, and confirmation are required' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await createUser(normalizedUsername, normalizedEmail, password);
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
    body('email').optional().isString(),
    body('username').optional().isString(),
    body('password').isString().withMessage('Password is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  try {
    const { email, username, password } = req.body;
    const identifier = (email || username || '').trim();

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await findUserByIdentifier(identifier);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
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

export default router;
