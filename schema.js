const db = require('./db');

function dropUser() {
  return db.any(`DROP TABLE router_user`);
}
function createUser() {
  return db.any(`
  CREATE TABLE IF NOT EXISTS router_user (
    name VARCHAR(255) UNIQUE NOT NULL,  
    password_digest VARCHAR(255) NOT NULL
  )`)
    .then(data => console.log(data))
    .catch(err => console.log('error: ', err));
}

function dropToggle() {
  return db.any(`DROP TABLE register_opts`);
}
function createRegToggle() {
  return db.any(`CREATE TABLE IF NOT EXISTS register_opts  (
    hide_register BOOLEAN DEFAULT false
  )`).then(data => console.log(data))
    .catch(err => console.log('oopsie: ', err))
}

dropUser().then(createUser)
dropToggle().then(createRegToggle);
