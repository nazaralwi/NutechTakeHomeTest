let express = require('express');
const jwt = require('jsonwebtoken');
let router = express.Router();
const pool = require('./db.js');

router.get('/banner', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT banner_name, banner_image, description FROM banner');
    res.status(200).json({ status: 0, message: 'Sukses', data: result.rows });
  } catch (err) {
    res.status(500).json({ status: 102, message: err.message, data: null });
  }
});

router.get('/services', async (req, res, next) => {
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

    const result = await pool.query('SELECT service_code, service_name, service_icon, service_tariff FROM services');
    res.status(200).json({ status: 0, message: 'Sukses', data: result.rows });
  } catch (err) {
    res.status(500).json({ status: 102, message: err.message, data: null });
  }
});

module.exports = router;