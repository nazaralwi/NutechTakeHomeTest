const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
let express = require('express');
let router = express.Router();
const pool = require('./db.js');

async function isUserExist(email) {
  const query = {
    text: 'SELECT * FROM users WHERE email = $1',
    values: [email],
  };

  const result = await pool.query(query);

  console.log('users rowCount ' + result.rowCount);

  return result.rowCount > 0;
}

router.post('/registration', async (req, res, next) => {
  const id = `user-${nanoid(16)}`;
  const { email, first_name, last_name, password } = req.body;

  const requiredFields = { email, first_name, last_name, password };

  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value) {
      return res.status(400).json({
        status: 102,
        message: `Parameter ${key} harus di isi`,
        data: null
      });
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ status: 102, message: 'Paramter email tidak sesuai format', data: null });
  }

  if (password.length < 8) {
    return res.status(400).json({ status: 102, message: 'Password length minimal 8 karakter', data: null });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    if (await isUserExist(email)) {
      return res.status(400).json({ status: 102, message: 'Email sudah terdaftar', data: null });
    }

    const query = {
      text: 'INSERT INTO users (id, email, first_name, last_name, password) VALUES ($1, $2, $3, $4, $5)',
      values: [id, email, first_name, last_name, hashedPassword],
    };

    await pool.query(query);
    res.status(201).json({ status: 0, message: 'Registrasi berhasil silahkan login', data: null });
  } catch (err) {
    res.status(500).json({ status: 102, message: err.message, data: null });
  }
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  const requiredFields = { email, password };

  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value) {
      return res.status(400).json({
        status: 102,
        message: `Parameter ${key} harus di isi`,
        data: null
      });
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ status: 102, message: 'Paramter email tidak sesuai format', data: null });
  }

  if (password.length < 8) {
    return res.status(400).json({ status: 102, message: 'Password length minimal 8 karakter', data: null });
  }

  try {
    if (!(await isUserExist(email))) {
      return res.status(400).json({ status: 103, message: 'Email tidak terdaftar', data: null });
    }

    const query = {
      text: 'SELECT * FROM users WHERE email = $1',
      values: [email],
    }

    const users = await pool.query(query);

    if (!users.rows.length) {
      return res.status(401).json({ status: 103, message: 'Username atau password salah', data: null });
    }

    const user = users.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ status: 103, message: 'Username atau password salah', data: null });
    }

    const payload = { email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    });

    res.status(200).json({ status: 0, message: 'Login Sukses', data: { token } });
  } catch (err) {
    res.status(500).json({ status: 102, message: err.message, data: null });
  }
});

router.get('/profile', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

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

    const query = {
      text: 'SELECT email, first_name, last_name, profile_image FROM users WHERE email = $1',
      values: [email],
    };

    const result = await pool.query(query);
    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 105,
        message: 'User tidak ditemukan',
        data: null,
      });
    }

    const user = result.rows[0];
    res.status(200).json({
      status: 0,
      message: 'Sukses',
      data: {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        profile_image: user.profile_image,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 102,
      message: err.message,
      data: null,
    });
  }
});

router.put('/profile/update', async (req, res, next) => {
  try {
    const { first_name, last_name } = req.body;
    const authHeader = req.headers.authorization;

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

    const query = {
      text: 'UPDATE users SET first_name = $1, last_name = $2 WHERE email = $3 RETURNING email, first_name, last_name, profile_image',
      values: [first_name, last_name, email],
    };

    const result = await pool.query(query);

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 105,
        message: 'User tidak ditemukan',
        data: null,
      });
    }
    const user = result.rows[0];

    res.status(200).json({
      status: 0,
      message: 'Update Pofile berhasil',
      data: {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        profile_image: user.profile_image,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 102,
      message: err.message,
      data: null,
    });
  }
});


module.exports = router;