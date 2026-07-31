const express = require('express');
const asyncHandler = require('express-async-handler');
const { ObjectId } = require('mongodb');
const { safeQueryId } = require('../config/db');

const router = express.Router();

// POST /tutors - Create tutor
router.post('/', asyncHandler(async (req, res) => {
  const tutorsCollection = req.tutorsCollection;
  const tutorData = req.body;
  
  if (!tutorData.name || !tutorData.email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }
  
  const newTutor = {
    ...tutorData,
    createdAt: new Date(),
    updatedAt: new Date(),
    totalSlots: tutorData.totalSlots || 10,
    availableSlots: tutorData.availableSlots || tutorData.totalSlots || 10,
  };
  
  const result = await tutorsCollection.insertOne(newTutor);
  res.status(201).json({ message: 'Tutor created', tutor: { ...newTutor, _id: result.insertedId } });
}));

// GET /tutors - Fetch with filters
router.get('/', asyncHandler(async (req, res) => {
  const tutorsCollection = req.tutorsCollection;
  const { email, search, startDate, endDate, subject } = req.query;
  
  let query = {};
  
  if (email) {
    query.email = email;
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
      { bio: { $regex: search, $options: 'i' } },
    ];
  }
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  
  if (subject) {
    query.subject = { $regex: subject, $options: 'i' };
  }
  
  const tutors = await tutorsCollection.find(query).sort({ createdAt: -1 }).toArray();
  res.json(tutors);
}));

// GET /tutors/:id - Single tutor
router.get('/:id', asyncHandler(async (req, res) => {
  const tutorsCollection = req.tutorsCollection;
  const tutor = await tutorsCollection.findOne(safeQueryId(req.params.id));
  
  if (!tutor) {
    return res.status(404).json({ message: 'Tutor not found' });
  }
  
  res.json(tutor);
}));

// PUT /tutors/:id - Update tutor
router.put('/:id', asyncHandler(async (req, res) => {
  const tutorsCollection = req.tutorsCollection;
  const updateData = { ...req.body, updatedAt: new Date() };
  delete updateData._id;
  
  const result = await tutorsCollection.updateOne(
    safeQueryId(req.params.id),
    { $set: updateData }
  );
  
  if (result.matchedCount === 0) {
    return res.status(404).json({ message: 'Tutor not found' });
  }
  
  const updatedTutor = await tutorsCollection.findOne(safeQueryId(req.params.id));
  res.json({ message: 'Tutor updated', tutor: updatedTutor });
}));

// DELETE /tutors/:id - Delete tutor
router.delete('/:id', asyncHandler(async (req, res) => {
  const tutorsCollection = req.tutorsCollection;
  const result = await tutorsCollection.deleteOne(safeQueryId(req.params.id));
  
  if (result.deletedCount === 0) {
    return res.status(404).json({ message: 'Tutor not found' });
  }
  
  res.json({ message: 'Tutor deleted' });
}));

module.exports = router;