const pool = require('./db');
const jwt = require('jsonwebtoken');
const { TokenError, InvariantError } = require('./errors');

const getEmailFromToken = async (authHeader) => {
  if (!authHeader) {
    throw new TokenError('Token tidak ditemukan. Harap login terlebih dahulu.');
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new TokenError('Token tidak tidak valid atau kadaluwarsa');
  }

  return decoded.email;
};

const isUserExist = async (email) => {
  const query = {
    text: 'SELECT * FROM users WHERE email = $1',
    values: [email],
  };

  const result = await pool.query(query);

  return result.rowCount > 0;
};

const checkRequiredField = (fields) => {
  for (const [key, value] of Object.entries(fields)) {
    if (!value) {
      throw new InvariantError(`Parameter ${key} harus di isi`);
    }
  }
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new InvariantError('Paramter email tidak sesuai format');
  }
};

const validatePassword = (password) => {
  if (password.length < 8) {
    throw new InvariantError('Password length minimal 8 karakter');
  }
};

const generateInvoiceNumber = () => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0'); // 3 digit acak
  return `INV${date}-${random}`;
};

module.exports = {
  getEmailFromToken,
  isUserExist,
  checkRequiredField,
  validateEmail,
  validatePassword,
  generateInvoiceNumber,
};
