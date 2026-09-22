import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import bcryptjs from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let db = null;

async function hashPassword(password) {
  const salt = await bcryptjs.genSalt(10);
  return await bcryptjs.hash(password, salt);
}

export async function initDatabase() {
  db = await open({
    filename: path.join(__dirname, 'database.db'),
    driver: sqlite3.Database
  });

  await db.exec('PRAGMA foreign_keys = ON');

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS finance_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS income (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      source TEXT,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT,
      value REAL NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT,
      balance REAL NOT NULL,
      bank TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      "limit" REAL NOT NULL,
      spent REAL DEFAULT 0,
      month TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      age INTEGER,
      date_of_birth TEXT,
      total_income REAL DEFAULT 0,
      total_expenses REAL DEFAULT 0,
      total_savings REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Simple migration helper: add missing columns if an older schema exists
  async function ensureColumn(table, columnName, columnDef) {
    try {
      const cols = await db.all(`PRAGMA table_info(${table})`);
      const found = cols.some(c => c.name === columnName);
      if (!found) {
        // columnDef should be the SQL type and optional default, e.g. 'TEXT' or 'DATETIME DEFAULT CURRENT_TIMESTAMP'
        await db.run(`ALTER TABLE ${table} ADD COLUMN ${columnName} ${columnDef}`);
        console.log(`Added missing column ${columnName} to ${table}`);
      }
    } catch (err) {
      console.warn(`Could not ensure column ${columnName} on ${table}:`, err.message || err);
    }
  }

  // Ensure common columns exist for backward compatibility
  await ensureColumn('users', 'email', 'TEXT');
  await ensureColumn('users', 'password_hash', 'TEXT');
  await ensureColumn('users', 'created_at', "DATETIME DEFAULT CURRENT_TIMESTAMP");
  await ensureColumn('users', 'updated_at', "DATETIME DEFAULT CURRENT_TIMESTAMP");
  await ensureColumn('profile', 'date_of_birth', 'TEXT');

  // Create the shared account used for first-time and hosted access.
  try {
    const allowDefaultUser = process.env.ALLOW_DEFAULT_USER === 'true';
    const defaultUsername = process.env.DEFAULT_USER_USERNAME || 'WELLTH_USER';
    const defaultEmail = (process.env.DEFAULT_USER_EMAIL || 'demo@wellth.app').trim().toLowerCase();
    const defaultPassword = process.env.DEFAULT_USER_PASSWORD || 'Wellth@2026';

    if (allowDefaultUser) {
      const existingUser = await db.get(
        'SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?',
        [defaultEmail, defaultUsername.toLowerCase()]
      );

      if (!existingUser) {
        const passwordHash = await hashPassword(defaultPassword);
        const result = await db.run(
          'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
          [defaultUsername, defaultEmail, passwordHash]
        );

        await db.run('INSERT INTO profile (user_id) VALUES (?)', [result.lastID]);
        console.log(`Default user created: ${defaultEmail}`);
      }
    } else {
      console.log('Skipping default user creation (ALLOW_DEFAULT_USER=false)');
    }
  } catch (error) {
    console.error('Error creating default user:', error);
  }

  console.log('Database initialized successfully');
  return db;
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}
