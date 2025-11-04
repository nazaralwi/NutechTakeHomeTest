const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
let express = require('express');
let router = express.Router();
const pool = require('./db.js');

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

    res.status(200).json({ status: 0, message: 'Login Sukses', data: { token: "this_should_be_token" } });  
  } catch (err) {
    res.status(500).json({ status: 102, message: err.message, data: null });
  }
});

module.exports = router;