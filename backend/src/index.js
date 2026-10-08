const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const workflowRoutes = require('./routes/workflowRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to FlowPilot AI Workflow Engine API'
  });
});

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'FlowPilot Backend Engine',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found.'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Express Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 FlowPilot Backend Server listening on port ${PORT}`);
});
