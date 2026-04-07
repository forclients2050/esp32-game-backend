const express = require('express');
const { signup, login, refreshToken } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh-token', auth, refreshToken);

module.exports = router;
