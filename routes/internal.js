const express = require('express');
const router = express.Router();
const pool = require('./db');

router.post('/reset', async (req, res) => {
  try {
    const auth = req.headers['x-internal-secret'];

    if (auth !== process.env.INTERNAL_KEY) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await pool.query('TRUNCATE users, transactions');

    res.status(200).json({
      status: 0,
      message: 'Database reset successfully',
    });
  } catch (err) {
    res.status(500).json({
      status: 102,
      message: err.message,
    });
  }
});

module.exports = router;
