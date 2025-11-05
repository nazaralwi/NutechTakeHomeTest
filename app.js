require('dotenv').config();
let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
let membershipRouter = require('./routes/membership');
let informationRouter = require('./routes/information');
let transactionRouter = require('./routes/transaction');
const internalRouter = require('./routes/internal');
const { AuthorizationError, InvariantError } = require('./routes/errors');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/', membershipRouter);
app.use('/', informationRouter);
app.use('/', transactionRouter);

if (process.env.NODE_ENV === 'development') {
  app.use('/internal', internalRouter);
}

app.use('/', express.static(path.join(process.cwd(), 'uploads')));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  if (err instanceof InvariantError) {
    return res.status(err.statusCode).json({
      status: 102,
      message: err.message,
      data: null,
    });
  }

  if (err instanceof AuthorizationError) {
    return res.status(err.statusCode).json({
      status: 108,
      message: err.message,
      data: null,
    });
  }

  return res.status(500).json({ 
    status: 102, 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
    data: null,
  });
});

module.exports = app;
