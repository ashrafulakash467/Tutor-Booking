const { ObjectId } = require('mongodb');

// In-memory data store for development
let db = null;
const store = {
  tutors: [],
  bookings: [],
  users: [],
};

// Shared collection data (persists across calls to collection())
const collections = {};

// Seed data
const sampleTutors = [
  {
    _id: new ObjectId("650000000000000000000001"),
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@example.com',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    subject: 'Mathematics',
    bio: 'PhD in Mathematics with 10+ years of teaching experience. Specializing in calculus, algebra, and statistics.',
    rating: 4.9,
    totalStudents: 250,
    totalSlots: 10,
    availableSlots: 7,
    price: 50,
    education: 'PhD in Mathematics, MIT',
    experience: '10 years',
    languages: ['English', 'French'],
    availability: ['Monday', 'Wednesday', 'Friday'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId("650000000000000000000002"),
    name: 'James Chen',
    email: 'james.chen@example.com',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    subject: 'Physics',
    bio: 'Physics researcher turned educator. Making complex physics concepts easy to understand.',
    rating: 4.8,
    totalStudents: 180,
    totalSlots: 10,
    availableSlots: 5,
    price: 55,
    education: 'MS in Physics, Stanford',
    experience: '8 years',
    languages: ['English', 'Mandarin'],
    availability: ['Tuesday', 'Thursday', 'Saturday'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId("650000000000000000000003"),
    name: 'Aisha Rahman',
    email: 'aisha.rahman@example.com',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha',
    subject: 'English Literature',
    bio: 'Published author and literature professor. Helping students discover the joy of reading and writing.',
    rating: 4.7,
    totalStudents: 320,
    totalSlots: 10,
    availableSlots: 8,
    price: 45,
    education: 'MA in English Literature, Oxford',
    experience: '12 years',
    languages: ['English', 'Urdu', 'Hindi'],
    availability: ['Monday', 'Tuesday', 'Thursday'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId("650000000000000000000004"),
    name: 'Carlos Rivera',
    email: 'carlos.rivera@example.com',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    subject: 'Spanish',
    bio: 'Native Spanish speaker with a passion for language teaching. Interactive and immersive learning methods.',
    rating: 4.9,
    totalStudents: 410,
    totalSlots: 10,
    availableSlots: 3,
    price: 40,
    education: 'BA in Linguistics, Universidad de Barcelona',
    experience: '15 years',
    languages: ['Spanish', 'English', 'Portuguese'],
    availability: ['Wednesday', 'Friday', 'Sunday'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId("650000000000000000000005"),
    name: 'Jhankar Mahbub',
    email: 'jhankar.mahbub@example.com',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jhankar',
    subject: 'Programming',
    bio: 'Senior software engineer and bestselling author. Teaching web development, JavaScript, and Python.',
    rating: 4.9,
    totalStudents: 5000,
    totalSlots: 10,
    availableSlots: 2,
    price: 60,
    education: 'MS in Computer Science, University of Dhaka',
    experience: '12 years',
    languages: ['English', 'Bengali'],
    availability: ['Monday', 'Wednesday', 'Friday'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId("650000000000000000000006"),
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    subject: 'Chemistry',
    bio: 'Chemistry PhD with innovative teaching methods. Making chemistry fun with practical demonstrations.',
    rating: 4.8,
    totalStudents: 195,
    totalSlots: 10,
    availableSlots: 6,
    price: 48,
    education: 'PhD in Chemistry, IIT Delhi',
    experience: '9 years',
    languages: ['English', 'Hindi'],
    availability: ['Tuesday', 'Thursday', 'Saturday'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Helper to compare values (handles ObjectId)
function valuesEqual(a, b) {
  if (a instanceof ObjectId && b instanceof ObjectId) {
    return a.toString() === b.toString();
  }
  if (a instanceof ObjectId && typeof b === 'string') {
    return a.toString() === b;
  }
  if (b instanceof ObjectId && typeof a === 'string') {
    return a === b.toString();
  }
  return a === b;
}

function matchesQuery(item, query) {
  if (!query || Object.keys(query).length === 0) return true;
  
  for (const [key, value] of Object.entries(query)) {
    if (key === '$or') {
      if (!Array.isArray(value)) continue;
      const orMatch = value.some(condition => matchesQuery(item, condition));
      if (!orMatch) return false;
      continue;
    }
    
    if (key === '$and') {
      if (!Array.isArray(value)) continue;
      const andMatch = value.every(condition => matchesQuery(item, condition));
      if (!andMatch) return false;
      continue;
    }
    
    if (key === '$nor') {
      if (!Array.isArray(value)) continue;
      const norMatch = value.some(condition => matchesQuery(item, condition));
      if (norMatch) return false;
      continue;
    }
    
    const itemValue = getNestedValue(item, key);
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Handle operators like $gte, $lte, $regex, $nin, $ne, $in
      if (value.$regex !== undefined) {
        const flags = value.$options || '';
        const regex = new RegExp(value.$regex, flags);
        if (!regex.test(String(itemValue))) return false;
        continue;
      }
      
      if (value.$gte !== undefined && !(itemValue >= value.$gte)) return false;
      if (value.$lte !== undefined && !(itemValue <= value.$lte)) return false;
      if (value.$gt !== undefined && !(itemValue > value.$gt)) return false;
      if (value.$lt !== undefined && !(itemValue < value.$lt)) return false;
      if (value.$ne !== undefined) {
        if (valuesEqual(itemValue, value.$ne)) return false;
        continue;
      }
      if (value.$nin !== undefined) {
        if (Array.isArray(value.$nin) && value.$nin.some(v => valuesEqual(itemValue, v))) return false;
        continue;
      }
      if (value.$in !== undefined) {
        if (Array.isArray(value.$in) && !value.$in.some(v => valuesEqual(itemValue, v))) return false;
        continue;
      }
      
      // If no operator matched, do exact match
      if (!valuesEqual(itemValue, value)) return false;
    } else {
      if (!valuesEqual(itemValue, value)) return false;
    }
  }
  return true;
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function applySort(items, sortObj) {
  if (!sortObj) return items;
  const [key, order] = Object.entries(sortObj)[0];
  return [...items].sort((a, b) => {
    const aVal = getNestedValue(a, key);
    const bVal = getNestedValue(b, key);
    if (aVal < bVal) return -1 * order;
    if (aVal > bVal) return 1 * order;
    return 0;
  });
}

function applyUpdate(item, update) {
  if (update.$set) {
    for (const [key, value] of Object.entries(update.$set)) {
      setNestedValue(item, key, value);
    }
  }
  if (update.$inc) {
    for (const [key, value] of Object.entries(update.$inc)) {
      const current = getNestedValue(item, key) || 0;
      setNestedValue(item, key, current + value);
    }
  }
  return item;
}

function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

// Create a collection that shares data across calls
function createSharedCollection(name) {
  if (!collections[name]) {
    collections[name] = [];
  }
  const data = collections[name];
  
  return {
    find(query = {}) {
      let results = data.filter(item => matchesQuery(item, query));
      return {
        sort(sortObj) {
          results = applySort(results, sortObj);
          return {
            toArray() { return Promise.resolve([...results]); }
          };
        },
        toArray() { return Promise.resolve([...results]); }
      };
    },
    findOne(query = {}) {
      const result = data.find(item => matchesQuery(item, query));
      return Promise.resolve(result || null);
    },
    insertOne(doc) {
      const newDoc = { ...doc, _id: doc._id || new ObjectId() };
      data.push(newDoc);
      return Promise.resolve({ insertedId: newDoc._id, acknowledged: true });
    },
    insertMany(docs) {
      const inserted = docs.map(doc => {
        const newDoc = { ...doc, _id: doc._id || new ObjectId() };
        data.push(newDoc);
        return newDoc;
      });
      return Promise.resolve({ insertedCount: inserted.length, insertedIds: inserted.map(d => d._id), acknowledged: true });
    },
    updateOne(filter, update) {
      const index = data.findIndex(item => matchesQuery(item, filter));
      if (index === -1) return Promise.resolve({ matchedCount: 0, modifiedCount: 0, acknowledged: true });
      data[index] = applyUpdate({ ...data[index] }, update);
      return Promise.resolve({ matchedCount: 1, modifiedCount: 1, acknowledged: true });
    },
    deleteOne(filter) {
      const index = data.findIndex(item => matchesQuery(item, filter));
      if (index === -1) return Promise.resolve({ deletedCount: 0, acknowledged: true });
      data.splice(index, 1);
      return Promise.resolve({ deletedCount: 1, acknowledged: true });
    },
    deleteMany(filter = {}) {
      if (Object.keys(filter).length === 0) {
        const count = data.length;
        data.length = 0;
        return Promise.resolve({ deletedCount: count, acknowledged: true });
      }
      const toRemove = data.filter(item => matchesQuery(item, filter));
      toRemove.forEach(item => {
        const idx = data.indexOf(item);
        if (idx !== -1) data.splice(idx, 1);
      });
      return Promise.resolve({ deletedCount: toRemove.length, acknowledged: true });
    },
    countDocuments(filter = {}) {
      if (Object.keys(filter).length === 0) return Promise.resolve(data.length);
      return Promise.resolve(data.filter(item => matchesQuery(item, filter)).length);
    },
    aggregate(pipeline) {
      let result = [...data];
      for (const stage of pipeline) {
        if (stage.$match) {
          result = result.filter(item => matchesQuery(item, stage.$match));
        }
        if (stage.$sort) {
          result = applySort(result, stage.$sort);
        }
        if (stage.$limit) {
          result = result.slice(0, stage.$limit);
        }
      }
      return {
        toArray() { return Promise.resolve(result); }
      };
    }
  };
}

async function connectDB() {
  if (db) return db;
  
  console.log("Using in-memory data store for development");
  
  // Initialize collections with seed data
  collections.tutors = sampleTutors.map(t => ({ ...t }));
  collections.bookings = [];
  collections.users = [
    {
      _id: new ObjectId("6500000000000000000000a1"),
      name: 'admin',
      email: 'admin@example.com',
      password: 'password123',
      photoURL: '/images/pexels-photo-5303546.jpg',
      role: 'admin',
      createdAt: new Date(),
    },
  ];
  
  console.log("In-memory database initialized with", collections.tutors.length, "sample tutors");
  
  db = {
    collection: (name) => createSharedCollection(name)
  };
  
  return db;
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
      console.error("Database connection failed:", err);
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

