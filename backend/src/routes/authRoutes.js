const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { register, login, updateProfile } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: { success: false, message: 'Too many authentication attempts, please try again later.' }
});

// POST /api/auth/register
router.post('/register', authLimiter, register);

// POST /api/auth/login
router.post('/login', authLimiter, login);

// PUT /api/auth/profile
router.put('/profile', verifyToken, updateProfile);

module.exports = router;
