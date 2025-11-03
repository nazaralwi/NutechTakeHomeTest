let express = require('express');
let router = express.Router();

router.post('/registration', (req, res, next) => {
  const { email, first_name, last_name, password } = req.body;

  res.status(201).json({ status: 0, message: 'Registrasi berhasil silahkan login', data: null });
});

module.exports = router;