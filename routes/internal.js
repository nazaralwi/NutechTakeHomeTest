const express = require('express');
const router = express.Router();
const pool = require('./db');
const { ForbiddenError } = require('./errors');

router.post('/reset', async (req, res) => {
  try {
    const auth = req.headers['x-internal-secret'];

    if (auth !== process.env.INTERNAL_KEY) {
      throw new ForbiddenError('Forbidden');
    }

    await pool.query('TRUNCATE users, transactions');

    return res.status(200).json({
      status: 0,
      message: 'Database reset successfully',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
