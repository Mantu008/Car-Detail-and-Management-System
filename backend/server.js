// Environment variables must be loaded before any module that reads them.
require('dotenv').config();

const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const { corsOrigin } = require('./config/cors');
const { initializeSocket } = require('./config/socket');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

connectDB();

const app = express();
const server = http.createServer(app);
initializeSocket(server);

app.set('trust proxy', 1);
app.disable('x-powered-by');

// Baseline security headers (the API only serves JSON and uploaded images).
app.use((_req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cross-Origin-Resource-Policy': 'cross-origin',
  });
  next();
});

app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.VERCEL !== '1') {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

app.get('/', (_req, res) => res.send('Car Management System API is running'));
app.get('/api/health', (_req, res) => res.json({ success: true, timestamp: new Date().toISOString() }));

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/auth/2fa', require('./routes/authRoutes'));
app.use('/api/cars', require('./routes/carRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.VERCEL !== '1') {
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;
