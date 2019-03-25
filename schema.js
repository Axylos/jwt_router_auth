const db = require('./db');

function dropUser() {
  return db.any(`DROP TABLE IF EXISTS router_user`);
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
  return db.any(`DROP TABLE IF EXISTS register_opts`);
}
function createRegToggle() {
  return db.any(`CREATE TABLE IF NOT EXISTS register_opts  (
    show_register BOOLEAN  DEFAULT false NOT NULL
  )`).then(data => console.log(data))
    .then(() => {
      return db.one(`INSERT INTO register_opts VALUES (true) RETURNING *`);
    }).then(data => console.log('row inserted: ', data))
    .catch(err => console.log('oopsie: ', err))
}


dropUser().then(createUser)
dropToggle().then(createRegToggle);
