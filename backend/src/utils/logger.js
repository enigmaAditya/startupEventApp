/* ============================================
   StartupEvents — Custom Logger with fs Streams
   Syllabus: BE Unit I — fs module, streams, Date,
             callbacks → async evolution
   ============================================ */

const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
// Demonstrates: fs.existsSync, fs.mkdirSync (sync file operations)
const logsDir = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create a writable stream for the log file
// Demonstrates: fs.createWriteStream (Stream — BE Unit I)
const logStream = fs.createWriteStream(
  path.join(logsDir, `app-${new Date().toISOString().split('T')[0]}.log`),
  { flags: 'a' } // 'a' = append mode
);

// Color codes for terminal output (using chalk@4 — CommonJS compatible)
let chalk;
try {
  chalk = require('chalk');
} catch {
  // Fallback if chalk not available
  chalk = {
    green: (s) => s,
    yellow: (s) => s,
    red: (s) => s,
    blue: (s) => s,
    gray: (s) => s,
  };
}

/**
 * Format a log entry
 * Demonstrates: template literals, Date formatting, string methods
 *
 * @param {string} level - Log level (INFO, WARN, ERROR, DEBUG)
 * @param {string} message - Log message
 * @returns {string}
 */
const formatLogEntry = (level, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.padEnd(5)}] ${message}`;
};

/**
 * Logger object — local module
 * Demonstrates: creating a local module, exporting functions,
 *               writing to streams, console output
 */
const logger = {
  /**
   * Log info message
   * @param {string} message
   */
  info: (message) => {
    const entry = formatLogEntry('INFO', message);
    console.log(chalk.green('ℹ'), chalk.green(entry));
    logStream.write(entry + '\n');
  },

  /**
   * Log warning message
   * @param {string} message
   */
  warn: (message) => {
    const entry = formatLogEntry('WARN', message);
    console.warn(chalk.yellow('⚠'), chalk.yellow(entry));
    logStream.write(entry + '\n');
  },

  /**
   * Log error message
   * @param {string} message
   */
  error: (message) => {
    const entry = formatLogEntry('ERROR', message);
    console.error(chalk.red('✖'), chalk.red(entry));
    logStream.write(entry + '\n');
  },

  /**
   * Log debug message (only in development)
   * @param {string} message
   */
  debug: (message) => {
    if (process.env.NODE_ENV !== 'production') {
      const entry = formatLogEntry('DEBUG', message);
      console.log(chalk.blue('🐛'), chalk.gray(entry));
      logStream.write(entry + '\n');
    }
  },

  /**
   * Log HTTP request (used by morgan)
   * @param {string} message
   */
  http: (message) => {
    const entry = formatLogEntry('HTTP', message.trim());
    logStream.write(entry + '\n');
  },
};

module.exports = logger;
