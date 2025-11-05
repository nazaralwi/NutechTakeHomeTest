const jwt = require('jsonwebtoken');
const { AuthorizationError } = require('./errors');

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

module.exports = { getEmailFromToken };