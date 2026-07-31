const express = require('express');
const asyncHandler = require('express-async-handler');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// POST /users/signup - Register
router.post('/signup', asyncHandler(async (req, res) => {
  const { name, email, password, photoURL } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }
  
  const normalizedEmail = email.trim().toLowerCase();
  const usersCollection = req.usersCollection;
  
  // Check for duplicate
  const existingUser = await usersCollection.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(409).json({ message: 'User already exists with this email' });
  }
  
  const newUser = {
    name,
    email: normalizedEmail,
    password, // Note: In production, hash with bcrypt
    photoURL: photoURL || '',
    createdAt: new Date(),
    role: 'user',
  };
  
  const result = await usersCollection.insertOne(newUser);
  const token = generateToken({ email: normalizedEmail, name, photoURL: photoURL || '' });
  
  res.status(201).json({
    message: 'User created successfully',
    token,
    user: { email: normalizedEmail, name, photoURL: photoURL || '' }
  });
}));

// POST /users/signin - Login
router.post('/signin', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  const normalizedEmail = email.trim().toLowerCase();
  const usersCollection = req.usersCollection;
  
  const user = await usersCollection.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  
  // Direct password comparison (use bcrypt in production)
  if (user.password !== password) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  
  const token = generateToken({ email: user.email, name: user.name, photoURL: user.photoURL || '' });
  
  res.json({
    message: 'Login successful',
    token,
    user: { email: user.email, name: user.name, photoURL: user.photoURL || '' }
  });
}));

// GET /users/profile - Get user profile (protected)
router.get('/profile', asyncHandler(async (req, res) => {
  const { verifyToken } = require('../middleware/auth');
  // Verify token manually for this route
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'tutor-booking-secret-key';
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const usersCollection = req.usersCollection;
    const user = await usersCollection.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      name: user.name,
      email: user.email,
      photoURL: user.photoURL || '',
      createdAt: user.createdAt,
    });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}));

module.exports = router;