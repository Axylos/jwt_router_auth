const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const path = require('path');
const logger = require('morgan');
const jwt = require('jsonwebtoken');
const PORT = 8085;
const app = express();
const db = require('./db');
const SECRET = 'A BIG HOLDAF SECRET#@$AKSFJKJ3421344ASDFK'
function makeToken(payload) {
  console.log('payload: ', payload);
  return jwt.sign(payload, SECRET);
}

const salt = bcrypt.genSaltSync(10);
app.use(logger('dev'));
app.use(cookieParser());

const urlParser = bodyParser.urlencoded({extended: true})

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(urlParser);
app.use(bodyParser.json());
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
  console.log(req.url);

  res.send(401);
});

app.get('/router/test', (req, res) => {
  console.log('router test: ', req.cookies);
  const token = req.cookies['router-token'];
  console.log('token to c;hecK ', token);
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      console.log('not a valid token');
      res.send(401);
    } else {
      console.log("you're good to go");
      res.send(200);
    }
  });
});

app.post('/foo', (req, res) => {
  console.log(req.headers);
  console.log(req.body);
  res.send(req.body);
})

app.get('/login', (req, res) => {
  res.status(200).render('login');
});

app.post('/login', (req, res) => {
  const name = req.body.username;
  const pword = req.body.password;

  db.one(`SELECT * FROM router_user WHERE name = $1`, name)
    .then(data => {
      console.log(JSON.stringify(data.password_digest));
      console.log(pword);
      console.log('trying to bcrypt')
      bcrypt.compare(pword, data.password_digest).then(hash => {
        if (!hash) {
          console.log('we had an oopsie: ', err);
          res.send(401);
        } else {
          const newToken = makeToken(data.name, SECRET);
          console.log('new token is: ', newToken);
          res.cookie('router-token', 
          newToken,
          {
            domain: 'draketalley.com',
            overwrite: true
          });
          res.render('success');
        }
      }).catch(err => {
        console.log('we had an oopsie: ', err);
        res.status(401).json({err})
      })
  });
});

app.get('/register', (req, res) => {
  res.status(200).render('register');
});

app.post('/register', urlParser, (req, res) => {
  console.log('body: ', req.body);
  const pword = req.body.password;
  const digest = bcrypt.hashSync(pword, salt);
  db.one(`INSERT INTO router_user VALUES ($1, $2) RETURNING *`, [req.body.username, digest])
    .then(data => {
      console.log(`user created: ${data}`);
      console.log(JSON.stringify(data));
      const newToken = makeToken(data.name, SECRET);
      console.log('new token is: ', newToken);
      res.cookie('router-token', 
        newToken,
        {
          domain: 'draketalley.com',
          overwrite: true
        });
      res.render('success');
    }).catch(err => res.json({err: `sad panda: ${err}`}));
})

app.get('/test', (req, res) => {
  console.log(req.cookies);
  res.send(200);
})

app.get('/router', (req, res) => {
  console.log(req.cookies);
  res.send(401);
});

app.listen(PORT, () => console.log('up and running'))
