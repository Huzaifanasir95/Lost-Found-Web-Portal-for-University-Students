const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const { submitFeedback } = require('../controllers/feedback.controller');

const feedbackSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

// Route to submit feedback
router.post('/', submitFeedback);

module.exports = router;
