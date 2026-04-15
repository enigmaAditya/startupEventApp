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

// Create Express app
const app = express();

// ============ MIDDLEWARE STACK ============
// Demonstrates: app.use(), middleware ordering matters

// 1. Security headers (helmet)
// Demonstrates: third-party middleware, security best practices
app.use(helmet());

// 2. CORS configuration
// Demonstrates: CORS middleware, options object
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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
app.use(express.static(path.join(__dirname, '../../frontend/src/pages')));
app.use('/css', express.static(path.join(__dirname, '../../frontend/src/css')));
app.use('/js', express.static(path.join(__dirname, '../../frontend/src/js')));
app.use('/assets', express.static(path.join(__dirname, '../../frontend/src/assets')));

// ============ API ROUTES ============
// Demonstrates: express.Router(), route prefixing, API versioning

app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'StartupEvents API is running',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ============ 404 HANDLER ============
// Demonstrates: app.all() — catches all HTTP methods
app.all('*', notFoundHandler);

// ============ ERROR HANDLER ============
// Demonstrates: error-handling middleware (4 params)
app.use(errorHandler);

module.exports = app;
