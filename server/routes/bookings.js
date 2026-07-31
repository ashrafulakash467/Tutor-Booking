const express = require('express');
const asyncHandler = require('express-async-handler');
const { ObjectId } = require('mongodb');
const { safeQueryId } = require('../config/db');

const router = express.Router();

// POST /bookings - Create with conflict detection
router.post('/', asyncHandler(async (req, res) => {
  const bookingsCollection = req.bookingsCollection;
  const tutorsCollection = req.tutorsCollection;
  const { tutorId, studentEmail, studentName, date, timeSlot, subject } = req.body;
  
  if (!tutorId || !studentEmail || !date) {
    return res.status(400).json({ message: 'tutorId, studentEmail, and date are required' });
  }
  
  // Check for duplicate active booking
  const existingBooking = await bookingsCollection.findOne({
    tutorId: tutorId,
    studentEmail: studentEmail,
    date: date,
    status: { $nin: ['cancelled', 'completed'] }
  });
  
  if (existingBooking) {
    return res.status(409).json({ message: 'You already have an active booking with this tutor on this date' });
  }
  
  const tutor = await tutorsCollection.findOne(safeQueryId(tutorId));
  if (tutor && tutor.availableSlots <= 0) {
    return res.status(400).json({ message: 'No available slots for this tutor' });
  }
  
  const newBooking = {
    tutorId,
    tutorName: tutor?.name || '',
    tutorSubject: tutor?.subject || subject || '',
    studentEmail,
    studentName: studentName || '',
    date,
    timeSlot: timeSlot || '',
    subject: subject || tutor?.subject || '',
    status: 'confirmed',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const result = await bookingsCollection.insertOne(newBooking);
  
  // Auto-decrement tutor's totalSlots
  if (tutor) {
    await tutorsCollection.updateOne(
      safeQueryId(tutorId),
      { $inc: { availableSlots: -1 } }
    );
  }
  
  res.status(201).json({ message: 'Booking created', booking: { ...newBooking, _id: result.insertedId } });
}));

// GET /bookings - Fetch by email (matches multiple email fields)
router.get('/', asyncHandler(async (req, res) => {
  const bookingsCollection = req.bookingsCollection;
  const { email, tutorEmail, status } = req.query;
  
  let query = {};
  
  if (email) {
    query.$or = [
      { studentEmail: email },
      { tutorEmail: email },
    ];
  }
  
  if (tutorEmail) {
    query.tutorEmail = tutorEmail;
  }
  
  if (status) {
    query.status = status;
  }
  
  const bookings = await bookingsCollection.find(query).sort({ createdAt: -1 }).toArray();
  res.json(bookings);
}));

// PATCH /bookings/:id - Cancel (restores tutor slot)
router.patch('/:id', asyncHandler(async (req, res) => {
  const bookingsCollection = req.bookingsCollection;
  const tutorsCollection = req.tutorsCollection;
  const { status } = req.body;
  
  const booking = await bookingsCollection.findOne(safeQueryId(req.params.id));
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  
  const updateData = { updatedAt: new Date() };
  if (status) updateData.status = status;
  
  await bookingsCollection.updateOne(
    safeQueryId(req.params.id),
    { $set: updateData }
  );
  
  // Restore tutor slot if cancelling
  if (status === 'cancelled' && booking.tutorId) {
    await tutorsCollection.updateOne(
      safeQueryId(booking.tutorId),
      { $inc: { availableSlots: 1 } }
    );
  }
  
  const updatedBooking = await bookingsCollection.findOne(safeQueryId(req.params.id));
  res.json({ message: 'Booking updated', booking: updatedBooking });
}));

module.exports = router;