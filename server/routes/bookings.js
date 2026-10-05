const express = require('express');
const asyncHandler = require('express-async-handler');
const { randomUUID } = require('node:crypto');
const { safeQueryId } = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

function parseDateOnly(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

// POST /bookings - Create a booking for the authenticated user
router.post('/', verifyToken, asyncHandler(async (req, res) => {
  const bookingsCollection = req.bookingsCollection;
  const tutorsCollection = req.tutorsCollection;
  const { tutorId, date, timeSlot, phone } = req.body;
  const studentEmail = req.user.email.trim().toLowerCase();
  const bookingDate = parseDateOnly(date);
  
  if (!tutorId || !bookingDate) {
    return res.status(400).json({ message: 'A valid tutorId and date are required' });
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (bookingDate < today) {
    return res.status(400).json({ message: 'Booking date cannot be in the past' });
  }
  
  // Check for duplicate active booking
  const existingBooking = await bookingsCollection.findOne({
    tutorId,
    studentEmail,
    date,
    status: { $nin: ['cancelled', 'completed'] }
  });
  
  if (existingBooking) {
    return res.status(409).json({ message: 'You already have an active booking with this tutor on this date' });
  }
  
  const tutorQuery = safeQueryId(tutorId);
  const tutor = await tutorsCollection.findOne(tutorQuery);
  if (!tutor) {
    return res.status(404).json({ message: 'Tutor not found' });
  }

  if (tutor.sessionStartDate) {
    const sessionStartDate = new Date(tutor.sessionStartDate);
    sessionStartDate.setUTCHours(0, 0, 0, 0);
    if (!Number.isNaN(sessionStartDate.getTime()) && bookingDate < sessionStartDate) {
      return res.status(400).json({ message: 'Booking is not available before the tutor session start date' });
    }
  }

  const slotResult = await tutorsCollection.updateOne(
    { ...tutorQuery, availableSlots: { $gt: 0 } },
    { $inc: { availableSlots: -1 } }
  );

  if (slotResult.modifiedCount === 0) {
    return res.status(400).json({ message: 'No available slots for this tutor' });
  }
  
  const newBooking = {
    tutorId,
    tutorName: tutor.name || '',
    tutorEmail: tutor.email || '',
    tutorSubject: tutor.subject || '',
    studentEmail,
    studentName: req.user.name || '',
    phone: phone || '',
    date,
    timeSlot: timeSlot || '',
    subject: tutor.subject || '',
    reference: randomUUID().split('-')[0].toUpperCase(),
    status: 'confirmed',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  try {
    const result = await bookingsCollection.insertOne(newBooking);
    return res.status(201).json({ message: 'Booking created', booking: { ...newBooking, _id: result.insertedId } });
  } catch (error) {
    // Roll back the reserved slot if the booking insert fails.
    await tutorsCollection.updateOne(
      tutorQuery,
      { $inc: { availableSlots: 1 } }
    );
    throw error;
  }
}));

// GET /bookings - Fetch bookings owned by the authenticated user
router.get('/', verifyToken, asyncHandler(async (req, res) => {
  const bookingsCollection = req.bookingsCollection;
  const { status } = req.query;
  const query = { studentEmail: req.user.email.trim().toLowerCase() };
  
  if (status) {
    query.status = status;
  }
  
  const bookings = await bookingsCollection.find(query).sort({ createdAt: -1 }).toArray();
  res.json(bookings);
}));

// PATCH /bookings/:id - Cancel an owned booking (restores one tutor slot)
router.patch('/:id', verifyToken, asyncHandler(async (req, res) => {
  const bookingsCollection = req.bookingsCollection;
  const tutorsCollection = req.tutorsCollection;
  const { status } = req.body;

  if (status !== 'cancelled') {
    return res.status(400).json({ message: 'Only booking cancellation is supported' });
  }
  
  const bookingQuery = safeQueryId(req.params.id);
  const booking = await bookingsCollection.findOne(bookingQuery);
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  const ownsBooking = booking.studentEmail === req.user.email.trim().toLowerCase();
  if (!ownsBooking && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'You can only cancel your own bookings' });
  }

  if (booking.status === 'cancelled') {
    return res.status(409).json({ message: 'Booking is already cancelled' });
  }
  
  const result = await bookingsCollection.updateOne(
    { ...bookingQuery, status: { $ne: 'cancelled' } },
    { $set: { status: 'cancelled', updatedAt: new Date() } }
  );

  if (result.modifiedCount === 0) {
    return res.status(409).json({ message: 'Booking is already cancelled' });
  }
  
  if (booking.tutorId) {
    const tutorQuery = safeQueryId(booking.tutorId);
    const tutor = await tutorsCollection.findOne(tutorQuery);
    if (tutor) {
      await tutorsCollection.updateOne(
        { ...tutorQuery, availableSlots: { $lt: tutor.totalSlots } },
        { $inc: { availableSlots: 1 } }
      );
    }
  }
  
  const updatedBooking = await bookingsCollection.findOne(bookingQuery);
  res.json({ message: 'Booking updated', booking: updatedBooking });
}));

module.exports = router;
