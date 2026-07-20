import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { initDatabase } from './database.js';
import authRoutes from './authRoutes.js';
import routes from './routes.js';

dotenv.config();

const app = express();

// Basic security headers
app.use(helmet());

// Request logging
app.use(morgan(process.env.LOG_FORMAT || 'combined'));

// Simple rate limiter
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || String(15 * 60 * 1000), 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Configure CORS more securely using ALLOWED_ORIGINS env var (comma-separated)
const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || '';
let corsOptions = {};

if (allowedOriginsEnv.trim()) {
  const allowedOrigins = allowedOriginsEnv.split(',').map(o => o.trim()).filter(Boolean);
  corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: Origin not allowed'), false);
    }
  };
} else {
  // If ALLOWED_ORIGINS not set, allow all (useful for quick local dev)
  corsOptions = { origin: true };
}

app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Initialize database before starting server
let server;

initDatabase().then(() => {
  console.log('Registering routes...');
  
  // Use auth routes at /api/auth
  app.use('/api/auth', authRoutes);
  console.log('✓ Auth routes registered at /api/auth');
  
  // Use other routes at /api
  app.use('/api', routes);
  console.log('✓ API routes registered at /api');

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Catch-all 404
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', path: req.path, method: req.method });
  });

  // Global error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err && err.message ? err.message : err);
    if (err && err.message && err.message.startsWith('CORS policy')) {
      return res.status(403).json({ error: err.message });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  });

  const PORT = process.env.PORT || 3001;
  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Is another server instance running?`);
      process.exit(1);
    }
    console.error('Server error:', err);
    process.exit(1);
  });
}).catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});