import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from './database.js';

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set');
  process.exit(1);
}

export async function hashPassword(password) {
  const salt = await bcryptjs.genSalt(10);
  return await bcryptjs.hash(password, salt);
}

export async function comparePassword(password, hash) {
  return await bcryptjs.compare(password, hash);
}

function buildUsername(username, email) {
  const candidate = (username || '').trim();
  if (candidate) {
    return candidate;
  }

  const fromEmail = (email || '').trim().toLowerCase().split('@')[0] || 'wellth-user';
  return fromEmail.replace(/[^a-zA-Z0-9._-]+/g, '_');
}

export async function createUser(username, email, password) {
  const db = getDatabase();
  const normalizedUsername = buildUsername(username, email);
  const normalizedEmail = (email || `${normalizedUsername.toLowerCase()}@accounts.wellth.local`).trim().toLowerCase();

  if (!normalizedUsername || !password) {
    throw new Error('Username and password are required');
  }

  try {
    const existingUser = await db.get(
      'SELECT * FROM users WHERE LOWER(username) = ? OR LOWER(email) = ?',
      [normalizedUsername.toLowerCase(), normalizedEmail]
    );

    if (existingUser) {
      throw new Error('That username is already taken');
    }

    const passwordHash = await hashPassword(password);

    const result = await db.run(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [normalizedUsername, normalizedEmail, passwordHash]
    );

    await db.run(
      'INSERT INTO profile (user_id) VALUES (?)',
      [result.lastID]
    );

    return {
      id: result.lastID,
      username: normalizedUsername,
      email: normalizedEmail,
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function findUserByIdentifier(identifier) {
  const db = getDatabase();
  const normalized = (identifier || '').trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  try {
    return await db.get(
      'SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?',
      [normalized, normalized]
    );
  } catch (error) {
    console.error('Error finding user:', error);
    throw error;
  }
}

export async function findUserByUsername(username) {
  return findUserByIdentifier(username);
}

export function generateJWT(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export function verifyJWT(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid JWT token');
  }
}

export async function getUserData(userId) {
  const db = getDatabase();

  try {
    const [expenses, income, assets, accounts, budgets, profile] = await Promise.all([
      db.all('SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC', [userId]),
      db.all('SELECT * FROM income WHERE user_id = ? ORDER BY date DESC', [userId]),
      db.all('SELECT * FROM assets WHERE user_id = ?', [userId]),
      db.all('SELECT * FROM accounts WHERE user_id = ?', [userId]),
      db.all('SELECT * FROM budgets WHERE user_id = ?', [userId]),
      db.get('SELECT * FROM profile WHERE user_id = ?', [userId])
    ]);

    return {
      expenses: expenses || [],
      income: income || [],
      assets: assets || [],
      accounts: accounts || [],
      budgets: budgets || [],
      profile: profile || { age: 0, total_income: 0, total_expenses: 0, total_savings: 0 }
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}
