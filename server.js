require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet'); // npm install helmet
const morgan = require('morgan'); // npm install morgan
const connectDB = require('./db');
const routes = require('./routes');

const app = express();

// ===================================================
// 1. SECURITY & MIDDLEWARE
// ===================================================

// Secure HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false, // Set to false to allow external access to uploaded images/PDFs
}));

// HTTP request logger
app.use(morgan('dev'));

// Configure CORS (Update origin in production)
app.use(cors({
  origin: process.env.CLIENT_URL || '*', 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
}));

// Parse incoming payloads with strict limits to prevent DoS attacks
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===================================================
// 2. ROUTES
// ===================================================

// Health Check / Root route
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'success',
    message: 'Job Portal API is up and running!',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api', routes);

// ===================================================
// 3. ERROR HANDLING
// ===================================================

// 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
    // Only send full stack trace in development mode
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ===================================================
// 4. SERVER STARTUP & GRACEFUL SHUTDOWN
// ===================================================

const PORT = process.env.PORT || 5000;
let server;

// Connect to Database first, THEN start listening for traffic
connectDB().then(() => {
  server = app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
  });
});

// Graceful Shutdown Handler
const gracefulShutdown = () => {
  console.log('\n🛑 Received kill signal, shutting down gracefully...');
  
  if (server) {
    server.close(async () => {
      console.log('✅ Closed out remaining HTTP connections.');
      const mongoose = require('mongoose');
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', gracefulShutdown); // Triggered by hosting platforms (Heroku, Render, AWS)
process.on('SIGINT', gracefulShutdown);  // Triggered by Ctrl+C in terminal