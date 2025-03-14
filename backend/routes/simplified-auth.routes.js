
const express = require('express');
const router = express.Router();
const authController = require('../controllers/simplified-auth.controller');

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get current user profile
router.get('/me', authController.getCurrentUser);

module.exports = router;
