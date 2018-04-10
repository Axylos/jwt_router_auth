const promise = require('bluebird');
const pg = require('pg-promise');

const options = {
  promiseLib: promise,
};

const config = {
  host: 'kunai',
  port: 5432,
  database: 'router_auth',
  user: 'postgres'
};

const pgp = pg(options);

const db = pgp(config);

module.exports = db;
