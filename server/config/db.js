const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const client = new MongoClient(process.env.DB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db = null;

async function connectDB() {
  if (db) return db;
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB");
    db = client.db("tutorBookingDB");
    return db;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

function getDB() {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB() first.");
  }
  return db;
}

// Auto-connect middleware
function dbMiddleware(req, res, next) {
  connectDB()
    .then((database) => {
      req.db = database;
      req.tutorsCollection = database.collection("tutors");
      req.bookingsCollection = database.collection("bookings");
      req.usersCollection = database.collection("users");
      next();
    })
    .catch((err) => {
      res.status(500).json({ message: "Database connection failed", error: err.message });
    });
}

// Helper for flexible ObjectId matching
function safeQueryId(id) {
  try {
    return { _id: new ObjectId(id) };
  } catch {
    return { _id: id };
  }
}

module.exports = { connectDB, getDB, dbMiddleware, safeQueryId, ObjectId };