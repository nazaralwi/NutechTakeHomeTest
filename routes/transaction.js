const { nanoid } = require('nanoid');
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const { getEmailFromToken, generateInvoiceNumber } = require('../utils/common');
const { InvariantError } = require('../utils/errors');

router.get('/balance', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const email = await getEmailFromToken(authHeader);

    const query = {
      text: 'SELECT balance FROM users WHERE email = $1',
      values: [email],
    };
    const result = await pool.query(query);

    return res.status(200).json({
      status: 0,
      message: 'Get Balance Berhasil',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
});

router.post('/topup', async (req, res, next) => {
  try {
    const { top_up_amount } = req.body;
    const authHeader = req.headers.authorization;
    const email = await getEmailFromToken(authHeader);

    if (typeof top_up_amount !== 'number' || top_up_amount < 0) {
      throw new InvariantError(
        'Paramter amount hanya boleh angka dan tidak boleh lebih kecil dari 0'
      );
    }

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
        userId,
      ],
    };
    await pool.query(recordTransactionQuery);

    return res.status(200).json({
      status: 0,
      message: 'Top Up Balance berhasil',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
});

router.post('/transaction', async (req, res, next) => {
  try {
    const { service_code } = req.body;
    const authHeader = req.headers.authorization;
    const email = await getEmailFromToken(authHeader);

    const getUserQuery = {
      text: 'SELECT id, balance FROM users WHERE email = $1',
      values: [email],
    };
    const user = (await pool.query(getUserQuery)).rows[0];

    const getServicesQuery = {
      text: 'SELECT * FROM services',
    };
    const services = (await pool.query(getServicesQuery)).rows;

    const service = services.find(
      (service) => service.service_code === service_code
    );

    if (!service) {
      throw new InvariantError('Service atau Layanan tidak ditemukan');
    }

    const isBalanceSufficient = user.balance >= service.service_tariff;

    if (!isBalanceSufficient) {
      throw new InvariantError('Saldo tidak cukup');
    }

    const reduceBalanceQuery = {
      text: 'UPDATE users SET balance = balance - $1 WHERE id = $2',
      values: [service.service_tariff, user.id],
    };
    await pool.query(reduceBalanceQuery);

    const invoiceNumber = generateInvoiceNumber();
    const transactionDate = new Date().toISOString();

    const recordTransactionQuery = {
      text: `
        INSERT INTO transactions 
        (id, invoice_number, transaction_type, description, total_amount, created_on, user_id) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      values: [
        `transaction-${nanoid(16)}`,
        invoiceNumber,
        'PAYMENT',
        service.service_name,
        service.service_tariff,
        transactionDate,
        user.id,
      ],
    };

    await pool.query(recordTransactionQuery);

    return res.status(200).json({
      status: 0,
      message: 'Transaksi berhasil',
      data: {
        invoice_number: invoiceNumber,
        service_code: service.service_code,
        service_name: service.service_name,
        transaction_type: 'PAYMENT',
        total_amount: service.service_tariff,
        created_on: transactionDate,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/transaction/history', async (req, res, next) => {
  try {
    const { offset: offsetStr, limit: limitStr } = req.query;
    const [offset, limit] = [Number(offsetStr) || 0, Number(limitStr) || 0];
    const authHeader = req.headers.authorization;
    const email = await getEmailFromToken(authHeader);

    const getUserQuery = {
      text: 'SELECT id FROM users WHERE email = $1',
      values: [email],
    };
    const user = (await pool.query(getUserQuery)).rows[0];

    const getTransactionQuery = {
      text: 'SELECT * FROM transactions WHERE user_id = $1',
      values: [user.id],
    };

    const transactions = (await pool.query(getTransactionQuery)).rows;
    const filteredTransactions = transactions
      .map((transaction) => ({
        invoice_number: transaction.invoice_number,
        transaction_type: transaction.transaction_type,
        description: transaction.description,
        total_amount: transaction.total_amount,
        created_on: transaction.created_on,
      }))
      .sort((a, b) => new Date(b.created_on) - new Date(a.created_on));

    const limitedTransaction =
      limit !== 0
        ? filteredTransactions.slice(offset, offset + limit)
        : filteredTransactions.slice(offset);

    return res.status(200).json({
      status: 0,
      message: 'Get History Berhasil',
      offset: offset,
      limit: limit,
      records: limitedTransaction,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
