const { nanoid } = require('nanoid');
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

const generateInvoiceNumber = () => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0'); // 3 digit acak
  return `INV${date}-${random}`;
};

router.post('/topup', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const { top_up_amount } = req.body;

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

    if (typeof top_up_amount !== 'number' || top_up_amount < 0) {
      return res.status(400).json({
        status: 102,
        message: 'Paramter amount hanya boleh angka dan tidak boleh lebih kecil dari 0',
        data: null,
      });
    }

    const { email } = decoded;

    const getUserIdQuery = {
      text: 'SELECT id FROM users WHERE email = $1',
      values: [email],
    };

    const userId = (await pool.query(getUserIdQuery)).rows[0].id;

    const topUpBalanceQuery = {
      text: 'UPDATE users SET balance = balance + $1 WHERE email = $2 RETURNING balance',
      values: [top_up_amount, email],
    };
    const result = await pool.query(topUpBalanceQuery);
    const recordTransactionQuery = {
      text: `
        INSERT INTO transactions 
        (id, invoice_number, transaction_type, description, total_amount, created_on, user_id) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      values: [
        `transaction-${nanoid(16)}`,
        generateInvoiceNumber(),
        'TOPUP',
        'Top Up balance',
        top_up_amount,
        new Date().toISOString(),
        userId
      ],
    };

    await pool.query(recordTransactionQuery);

    res.status(200).json({ status: 0, message: 'Top Up Balance berhasil', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: 102, message: err.message, data: null });
  }
});


module.exports = router;