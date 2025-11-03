const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.HOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
});

pool.connect()
  .then(() => console.log('PostgreSQL connected'))
  .catch((err) => console.error('Connection error', err.stack));

module.exports = pool;