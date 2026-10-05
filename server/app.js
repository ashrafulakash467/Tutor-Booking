const dotenv = require('dotenv');
dotenv.config({ quiet: true });

const express = require('express');
const cors = require('cors');
const { dbMiddleware } = require('./config/db');

const app = express();

const localClientOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];
const configuredClientOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);
const allowedOrigins = new Set([
  ...localClientOrigins,
  ...configuredClientOrigins,
]);

const corsOptions = {
  origin(origin, callback) {
    // Requests without an Origin header include server-to-server calls and API tools.
    if (!origin || allowedOrigins.has(origin.replace(/\/$/, ''))) {
      return callback(null, true);
    }

    const error = new Error('Origin is not allowed by CORS');
    error.status = 403;
    return callback(error);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json({ limit: '10mb' }));

// Database connection middleware (auto-connects on every request)
app.use(dbMiddleware);

// Routes
app.use('/users', require('./routes/users'));
app.use('/tutors', require('./routes/tutors'));
app.use('/bookings', require('./routes/bookings'));
// app.use('/', require('./routes/seed'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Tutor-Booking API is running' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  const status = error.status || 500;
  if (status >= 500) {
    console.error(error);
  }

  return res.status(status).json({
    message: status >= 500 ? 'Internal server error' : error.message,
  });
});

module.exports = app;
