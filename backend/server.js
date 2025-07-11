// backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const employeeRoutes = require('./routes/employeesRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const { startEmployeeSync } = require('./utils/apiSync');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Allow both frontend ports
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));
app.use(express.json());

// MongoDB Connection with better error handling
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/cwc-connect';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
    
    // Only start employee sync after successful DB connection
    try {
      await startEmployeeSync();
      console.log('Employee sync started');
    } catch (syncErr) {
      console.error('Employee sync failed:', syncErr.message);
      // Don't crash the server if sync fails
    }
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.log('Server will continue without database connection');
    // Don't crash the server if MongoDB is not available
  }
};

// Connect to database
connectDB();

// Health check endpoint (before other routes)
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'OK', 
    message: 'CWC Connect Backend is running',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/chatbot', chatbotRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

