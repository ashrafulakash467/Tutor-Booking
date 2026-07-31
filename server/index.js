const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { dbMiddleware } = require('./config/db');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Database connection middleware (auto-connects on every request)
app.use(dbMiddleware);

// Routes
app.use('/users', require('./routes/users'));
app.use('/tutors', require('./routes/tutors'));
app.use('/bookings', require('./routes/bookings'));
app.use('/', require('./routes/seed'));

// Basic route
app.get('/', (req, res) => {
  res.send('Tutor Booking Server is running');
});

// Start server
app.listen(port, () => {
  console.log(`Tutor Booking Server is running on port ${port}`);
});