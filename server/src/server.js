const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Standard Middlewares
app.use(cors());
app.use(express.json());

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
