const express = require('express');
const router = express.Router();

// @route   GET api/users
// @desc    Test route
// @access  Public
router.get('/', (req, resp) => resp.send('User route'));

module.exports = router;
