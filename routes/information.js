const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const pool = require('./db.js');

class ClientError extends Error {
  constructor(message, statusCode = 400) {
    super(message);

    if (this.constructor.name === 'ClientError') {
      throw new Error('cannot instantiate abstract class');
    }

    this.statusCode = statusCode;
    this.name = 'ClientError';
  }
}

class AuthorizationError extends ClientError {
  constructor(message) {
    super(message, 401);
    this.name = 'AuthorizationError';
  }
}

async function getEmailFromToken(authHeader) {
  if (!authHeader) {
    throw new AuthorizationError('Token tidak ditemukan. Harap login terlebih dahulu.');
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new AuthorizationError('Token tidak tidak valid atau kadaluwarsa');
  }

  return decoded.email;
}

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
    const email = await getEmailFromToken(authHeader);

    const result = await pool.query('SELECT service_code, service_name, service_icon, service_tariff FROM services');
    res.status(200).json({ status: 0, message: 'Sukses', data: result.rows });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return res.status(err.statusCode).json({
        status: 108,
        message: err.message,
        data: null,
      });
    }
    res.status(500).json({ status: 102, message: err.message, data: null });
  }
});

module.exports = router;