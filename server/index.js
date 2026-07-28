const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require('mongodb');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// MongoDB Connection
const uri = process.env.DB_URI;
if (!uri) {
  console.error('DB_URI is not defined in .env file');
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Database and Collections
    const db = client.db("tutorBookingDB");
    const tutorsCollection = db.collection("tutors");
    const bookingsCollection = db.collection("bookings");
    const usersCollection = db.collection("users");

    // Export collections for use in routes
    app.locals.tutorsCollection = tutorsCollection;
    app.locals.bookingsCollection = bookingsCollection;
    app.locals.usersCollection = usersCollection;

    // Basic route
    app.get('/', (req, res) => {
      res.send('Tutor Booking Server is running');
    });

    // Start server
    app.listen(port, () => {
      console.log(`Tutor Booking Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

run().catch(console.dir);