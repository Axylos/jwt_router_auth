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
require('dotenv').config();
const SECRET = process.env.SECRET;

function makeToken(payload) {
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

  res.send(401);
});

app.get('/toggle-register/', (req, res) => {
  const { val } = req.query;
  db.one(`UPDATE register_opts SET show_register = $1`, val);
  res.status(200).json({msg: `val is: ${val}` });
});

app.get('/router/test', (req, res) => {
  const token = req.cookies['router-token'];
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      res.send(401);
    } else {
      res.send(200);
    }
  });
});

app.post('/foo', (req, res) => {
  res.send(req.body);
})

app.get('/login', (req, res) => {
  res.status(200).render('login');
});

app.post('/login', (req, res) => {
  const name = req.body.username;
  const pword = req.body.password;

  db.oneOrNone(`SELECT * FROM router_user WHERE name = $1`, name)
    .then(data => {
      if (!data) {
        res.send(401);
      }
      bcrypt.compare(pword, data.password_digest).then(hash => {
        if (!hash) {
          res.send(401);
        } else {
          const newToken = makeToken(data.name, SECRET);
          res.cookie('router-token', 
          newToken,
          {
            domain: 'draketalley.com',
            overwrite: true
          });
          res.render('success');
        }
      }).catch(err => {
        res.status(401).json({err})
      })
  });
});

app.get('/register', (req, res) => {
  db.one(`SELECT show_register FROM register_opts`)
    .then(data => {
      const showReg = data.show_register;
      if (showReg) {
        res.status(200).render('register');
      } else {
        res.render('blocked');
      }

    })
});

app.post('/register', urlParser, (req, res) => {
  const pword = req.body.password;
  const digest = bcrypt.hashSync(pword, salt);
  db.one(`INSERT INTO router_user VALUES ($1, $2) RETURNING *`, [req.body.username, digest])
    .then(data => {
      const newToken = makeToken(data.name, SECRET);
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
  res.send(200);
})

app.get('/router', (req, res) => {
  res.send(401);
});

app.listen(PORT, () => console.log('up and running'))
