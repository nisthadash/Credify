const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Security Headers
app.use(helmet());

// Standard Middlewares
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.startsWith('http://localhost:') || 
                      origin.startsWith('http://127.0.0.1:');
                      
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow sending cookies
}));
app.use(express.json());
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} from ${req.ip}`);
  next();
});

// Import route modules
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const eligibilityRoutes = require('./routes/eligibilityRoutes');
const credentialRoutes = require('./routes/credentialRoutes');
const verifyRoutes = require('./routes/verifyRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

// API Health Check / Welcome page
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'Credify API',
    description: 'Gasless Onchain Credentials Backend Server',
    version: '1.0.0',
    status: 'Operational',
    network: 'Base Sepolia (84532)',
    timestamp: new Date()
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/eligible', eligibilityRoutes);
app.use('/api/credentials', credentialRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/webhooks', webhookRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

// Start server function
const startServer = async () => {
  // Connect to Database
  await connectDB();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    logger.info(`Credify Backend Server is running in active development mode on port ${PORT}`);
    logger.info(`API Health Check: http://localhost:${PORT}/`);
  });
};

startServer();
