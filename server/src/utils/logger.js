const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// File streams
const combinedLogStream = fs.createWriteStream(path.join(logsDir, 'combined.log'), { flags: 'a' });
const errorLogStream = fs.createWriteStream(path.join(logsDir, 'error.log'), { flags: 'a' });

const formatMessage = (level, args) => {
  const msg = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : arg)).join(' ');
  return `[${level}] [${new Date().toISOString()}]: ${msg}\n`;
};

const info = (...args) => {
  const formatted = formatMessage('INFO', args);
  console.log(`[INFO] [${new Date().toISOString()}]:`, ...args);
  combinedLogStream.write(formatted);
};

const warn = (...args) => {
  const formatted = formatMessage('WARN', args);
  console.warn(`[WARN] [${new Date().toISOString()}]:`, ...args);
  combinedLogStream.write(formatted);
};

const error = (...args) => {
  const formatted = formatMessage('ERROR', args);
  console.error(`[ERROR] [${new Date().toISOString()}]:`, ...args);
  combinedLogStream.write(formatted);
  errorLogStream.write(formatted);
};

module.exports = {
  info,
  warn,
  error
};
