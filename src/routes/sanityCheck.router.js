const express = require('express')
const router = express.Router()

// sanity check
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Hello world' });
});

module.exports = router