const express = require('express');
const asyncHandler = require('express-async-handler');

const router = express.Router();

// GET /seed-figma-tutors - Seeds 6 sample tutors
router.get('/seed-figma-tutors', asyncHandler(async (req, res) => {
  const tutorsCollection = req.tutorsCollection;
  
  const sampleTutors = [
    {
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
  
  // Clear existing tutors and insert sample data
  await tutorsCollection.deleteMany({});
  const result = await tutorsCollection.insertMany(sampleTutors);
  
  res.json({
    message: 'Sample tutors seeded successfully',
    count: result.insertedCount,
    tutors: sampleTutors,
  });
}));

module.exports = router;