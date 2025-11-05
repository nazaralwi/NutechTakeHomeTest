const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const express = require('express');
const router = express.Router();
const pool = require('./db');
const upload = require('./upload');
const { getEmailFromToken, isUserExist, checkRequiredField } = require('./common');
const { InvariantError } = require('./errors');

router.post('/registration', async (req, res, next) => {
  try {
    const id = `user-${nanoid(16)}`;
    const { email, first_name, last_name, password } = req.body;

    checkRequiredField({ email, first_name, last_name, password });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new InvariantError('Paramter email tidak sesuai format');
    }

    if (password.length < 8) {
      throw new InvariantError('Password length minimal 8 karakter');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (await isUserExist(email)) {
      throw new InvariantError('Email sudah terdaftar');
    }

    const query = {
      text: 'INSERT INTO users (id, email, first_name, last_name, password) VALUES ($1, $2, $3, $4, $5)',
      values: [id, email, first_name, last_name, hashedPassword],
    };

    await pool.query(query);
    return res.status(201).json({ status: 0, message: 'Registrasi berhasil silahkan login', data: null });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    checkRequiredField({ email, password });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new InvariantError('Paramter email tidak sesuai format');
    }

    if (password.length < 8) {
      throw new InvariantError('Password length minimal 8 karakter');
    }

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

    return res.status(200).json({ status: 0, message: 'Login Sukses', data: { token } });
  } catch (err) {
    next(err);
  }
});

router.get('/profile', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const email = await getEmailFromToken(authHeader);

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
    return res.status(200).json({
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
    next(err);
  }
});

router.put('/profile/update', async (req, res, next) => {
  try {
    const { first_name, last_name } = req.body;
    const authHeader = req.headers.authorization;
    const email = await getEmailFromToken(authHeader);

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

    return res.status(200).json({
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
    next(err);
  }
});

router.put('/profile/image', (req, res, next) => {
  upload.single('file')(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        throw new InvariantError(err.message);
      } else if (err) {
        throw new InvariantError(err.message);
      }

      if (!req.file) {
        throw new InvariantError('File tidak ditemukan');
      }

      const imagePath = req.file.path;
      const imageFileName = path.basename(imagePath);

      const authHeader = req.headers.authorization;
      const email = await getEmailFromToken(authHeader);

      const query = {
        text: 'UPDATE users SET profile_image = $1 WHERE email = $2 RETURNING email, first_name, last_name, profile_image',
        values: [imageFileName, email],
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

      return res.status(200).json({
        status: 0,
        message: 'Update Profile Image berhasil',
        data: {
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          profile_image: `http://${process.env.HOST}:${process.env.PORT}/${user.profile_image}`,
        },
      });
    } catch (err) {
      next(err);
    }
  });
});

module.exports = router;