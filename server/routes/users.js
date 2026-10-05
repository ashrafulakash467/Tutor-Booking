const express = require('express');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const { generateToken, verifyToken } = require('../middleware/auth');

const router = express.Router();
const PASSWORD_HASH_ROUNDS = 10;

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
  
  const passwordHash = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
  const newUser = {
    name,
    email: normalizedEmail,
    password: passwordHash,
    photoURL: photoURL || '',
    createdAt: new Date(),
    role: 'user',
  };
  
  const result = await usersCollection.insertOne(newUser);
  const token = generateToken({ email: normalizedEmail, name, photoURL: photoURL || '', role: 'user' });
  
  res.status(201).json({
    message: 'User created successfully',
    token,
    user: { email: normalizedEmail, name, photoURL: photoURL || '', role: 'user' }
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
  
  const hasBcryptPassword = typeof user.password === 'string' && /^\$2[aby]\$/.test(user.password);
  const passwordMatches = hasBcryptPassword
    ? await bcrypt.compare(password, user.password)
    : user.password === password;

  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Transparently migrate legacy plaintext passwords after a valid login.
  if (!hasBcryptPassword) {
    const passwordHash = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { password: passwordHash, updatedAt: new Date() } }
    );
  }
  
  const token = generateToken({ email: user.email, name: user.name, photoURL: user.photoURL || '', role: user.role || 'user' });
  
  res.json({
    message: 'Login successful',
    token,
    user: { email: user.email, name: user.name, photoURL: user.photoURL || '', role: user.role || 'user' }
  });
}));

// GET /users/profile - Get user profile (protected)
router.get('/profile', verifyToken, asyncHandler(async (req, res) => {
  const usersCollection = req.usersCollection;
  const user = await usersCollection.findOne({ email: req.user.email });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    name: user.name,
    email: user.email,
    photoURL: user.photoURL || '',
    role: user.role || 'user',
    createdAt: user.createdAt,
  });
}));

module.exports = router;
