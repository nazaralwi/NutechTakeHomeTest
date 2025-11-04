let express = require('express');
let router = express.Router();
const pool = require('./db.js');

router.get('/banner', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT banner_name, banner_image, description FROM banner');
    res.status(200).json({ status: 0, message: 'Sukses', data: result.rows });
  } catch (err) {
    res.status(500).json({ status: 102, message: err.message, data: null });
  }
});

module.exports = router;