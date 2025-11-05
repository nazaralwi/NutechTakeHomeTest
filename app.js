require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const membershipRouter = require('./routes/membership');
const informationRouter = require('./routes/information');
const transactionRouter = require('./routes/transaction');
const internalRouter = require('./routes/internal');
const { ClientError } = require('./utils/errors');

const app = express();

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
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  if (err instanceof ClientError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      data: null,
    });
  }

  return res.status(500).json({
    status: err.status,
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Internal Server Error',
    data: null,
  });
});

module.exports = app;
