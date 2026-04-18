/* ============================================
   StartupEvents — Express Application Setup
   Syllabus: BE Unit II — Express setup, middleware,
             app.use(), error handling
   BE Unit III — helmet, CORS, rate limiting
   ============================================ */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

const config = require('./config');
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const rateLimiter = require('./middlewares/rateLimiter');

// Import routes
const eventRoutes = require('./routes/eventRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes = require('./routes/aiRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

// Create Express app
const app = express();

// ============ MIDDLEWARE STACK ============
// Demonstrates: app.use(), middleware ordering matters

// 1. Security headers (helmet)
// Demonstrates: third-party middleware, security best practices
app.use(helmet());

// 2. CORS configuration
const allowedOrigins = config.corsOrigin 
  ? config.corsOrigin.split(',').map(o => o.trim()) 
  : ['http://localhost:3000', 'https://startup-event-app.vercel.app'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(ao => origin.startsWith(ao)) || origin.includes('vercel.app');
    
    if (isAllowed || config.nodeEnv === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

// 3. Rate limiting
// Demonstrates: rate limiter middleware, protecting against abuse
app.use('/api/', rateLimiter);

// 4. Request body parsers
// Demonstrates: built-in middleware, JSON parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 5. Cookie parser
// Demonstrates: cookie-parser middleware
app.use(cookieParser());

// 6. HTTP request logging (morgan → custom logger)
// Demonstrates: morgan middleware, stream integration
app.use(morgan('short', {
  stream: { write: (message) => logger.http(message) },
}));

// 7. Serve static frontend files
// In production: serve Vite-built dist folder
// In development: serve source files directly (Vite dev server handles most requests)
if (config.nodeEnv === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
} else {
  app.use(express.static(path.join(__dirname, '../../frontend/src/pages')));
  app.use('/css', express.static(path.join(__dirname, '../../frontend/src/css')));
  app.use('/js', express.static(path.join(__dirname, '../../frontend/src/js')));
  app.use('/assets', express.static(path.join(__dirname, '../../frontend/src/assets')));
}

// ============ API ROUTES ============
// Demonstrates: express.Router(), route prefixing, API versioning

app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/recommendations', recommendationRoutes);

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'StartupEvents API is running',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ============ FRONTEND CATCH-ALL (production) ============
// Serve built frontend for non-API routes so direct URL access works
if (config.nodeEnv === 'production') {
  app.get('{*path}', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    
    // For our MPA: if someone hits /pages/... directly, try to serve it.
    // If not found, fallback to index.html
    const filePath = path.join(__dirname, '../../frontend/dist', req.path);
    res.sendFile(filePath, (err) => {
      if (err) {
        res.sendFile(path.join(__dirname, '../../frontend/dist/pages/index.html'));
      }
    });
  });
}

// ============ 404 HANDLER ============
// Demonstrates: app.all() — catches all HTTP methods
app.all('{*path}', notFoundHandler);

// ============ ERROR HANDLER ============
// Demonstrates: error-handling middleware (4 params)
app.use(errorHandler);

module.exports = app;
