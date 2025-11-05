const express = require('express');
const router = express.Router();
const pool = require('./db');
const { getEmailFromToken } = require('./common');

router.get('/banner', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT banner_name, banner_image, description FROM banner'
    );
    return res.status(200).json({
      status: 0,
      message: 'Sukses',
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/services', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const email = await getEmailFromToken(authHeader);

    const result = await pool.query(
      'SELECT service_code, service_name, service_icon, service_tariff FROM services'
    );
    return res.status(200).json({
      status: 0,
      message: 'Sukses',
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
