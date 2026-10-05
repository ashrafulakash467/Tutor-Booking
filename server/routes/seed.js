const express = require('express');

const router = express.Router();

// Disabled to prevent accidental or unauthenticated deletion of tutor data.
router.get('/seed-figma-tutors', (req, res) => {
  res.status(410).json({ message: 'This seed endpoint is disabled.' });
});

module.exports = router;
