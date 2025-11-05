const pool = require('./db');
const jwt = require('jsonwebtoken');
const { TokenError, InvariantError } = require('./errors');

async function getEmailFromToken(authHeader) {
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
}

async function isUserExist(email) {
  const query = {
    text: 'SELECT * FROM users WHERE email = $1',
    values: [email],
  };

  const result = await pool.query(query);

  return result.rowCount > 0;
}

function checkRequiredField(fields) {
  for (const [key, value] of Object.entries(fields)) {
    if (!value) {
      throw new InvariantError(`Parameter ${key} harus di isi`);
    }
  }
}

module.exports = { getEmailFromToken, isUserExist, checkRequiredField };