let express = require('express');
const jwt = require('jsonwebtoken');
let router = express.Router();
const pool = require('./db.js');

router.get('/balance', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        status: 108,
        message: 'Token tidak ditemukan. Harap login terlebih dahulu.',
        data: null,
      });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        status: 108,
        message: 'Token tidak tidak valid atau kadaluwarsa',
        data: null,
      });
    }

    console.log('decoded ' + decoded);
    const { email } = decoded;

    console.log('email ' + email);

    const query = {
      text: 'SELECT balance FROM users WHERE email = $1',
      values: [email],
    };
    
    const result = await pool.query(query);
    res.status(200).json({ status: 0, message: 'Get Balance Berhasil', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: 102, message: err.message, data: null });
  }
});

module.exports = router;