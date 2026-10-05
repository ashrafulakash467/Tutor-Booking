const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required. Set it in the server environment.');
}

function generateToken(user) {
  return jwt.sign(
    { email: user.email, name: user.name, photoURL: user.photoURL, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

async function isAdmin(req, res, next) {
  try {
    const admin = await req.usersCollection.findOne(
      { email: req.user?.email },
      { projection: { role: 1 } }
    );

    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.user.role = 'admin';
    return next();
  } catch (error) {
    return next(error);
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      // Token invalid, continue without user
    }
  }
  next();
}

module.exports = { generateToken, verifyToken, isAdmin, optionalAuth };
