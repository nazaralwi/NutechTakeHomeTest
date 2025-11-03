let express = require('express');
let router = express.Router();

router.post('/registration', (req, res, next) => {
  const { email, first_name, last_name, password } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ status: 102, message: 'Paramter email tidak sesuai format', data: null });
  }

  res.status(201).json({ status: 0, message: 'Registrasi berhasil silahkan login', data: null });
});

module.exports = router;