const dns = require('node:dns');
const { MongoClient, ObjectId } = require('mongodb');

const DATABASE_NAME = (process.env.MONGODB_DB || 'tutor-booking').trim();
const COLLECTION_NAMES = ['users', 'tutors', 'bookings'];

let client = null;
let db = null;
let connectionPromise = null;

function configureDns() {
  const configuredServers = process.env.MONGODB_DNS_SERVERS;

  if (!configuredServers) return;

  const servers = configuredServers
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  if (servers.length > 0) {
    dns.setServers(servers);
  }
}

function getMongoUri() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      'MongoDB connection URI is missing. Set MONGODB_URI in server/.env.'
    );
  }

  return uri;
}

async function ensureCollections(database) {
  const existingCollections = await database
    .listCollections({}, { nameOnly: true })
    .toArray();
  const existingNames = new Set(existingCollections.map(({ name }) => name));

  for (const collectionName of COLLECTION_NAMES) {
    if (!existingNames.has(collectionName)) {
      await database.createCollection(collectionName);
    }
  }
}

async function connectDB() {
  if (db) return db;
  if (connectionPromise) return connectionPromise;

  configureDns();

  connectionPromise = (async () => {
    const mongoClient = new MongoClient(getMongoUri(), {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 0,
    });

    try {
      await mongoClient.connect();

      const database = mongoClient.db(DATABASE_NAME);
      await database.command({ ping: 1 });
      await ensureCollections(database);

      client = mongoClient;
      db = database;

      console.log(`Connected to MongoDB Atlas database: ${DATABASE_NAME}`);
      return db;
    } catch (error) {
      await mongoClient.close().catch(() => {});
      throw error;
    }
  })();

  try {
    return await connectionPromise;
  } finally {
    connectionPromise = null;
  }
}

function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }

  return db;
}

async function closeDB() {
  const activeClient = client;
  client = null;
  db = null;
  connectionPromise = null;

  if (activeClient) {
    await activeClient.close();
  }
}

async function dbMiddleware(req, res, next) {
  try {
    const database = await connectDB();

    req.db = database;
    req.usersCollection = database.collection('users');
    req.tutorsCollection = database.collection('tutors');
    req.bookingsCollection = database.collection('bookings');

    next();
  } catch (error) {
    console.error('Database connection failed:', error.message);
    res.status(503).json({ message: 'Database connection failed' });
  }
}

function safeQueryId(id) {
  return ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
}

module.exports = {
  COLLECTION_NAMES,
  DATABASE_NAME,
  ObjectId,
  closeDB,
  connectDB,
  dbMiddleware,
  getDB,
  safeQueryId,
};
