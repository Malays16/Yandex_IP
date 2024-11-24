const express = require('express');
const passport = require('passport');
const YandexStrategy = require('passport-yandex').Strategy;
require('dotenv').config();

const YANDEX_CLIENT_ID = process.env.YANDEX_CLIENT_ID;
const YANDEX_CLIENT_SECRET = process.env.YANDEX_CLIENT_SECRET;

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(new YandexStrategy({
  clientID: YANDEX_CLIENT_ID,
  clientSecret: YANDEX_CLIENT_SECRET,
  callbackURL: 'http://127.0.0.1:3000/auth/yandex/callback'
}, (accessToken, refreshToken, profile, done) => {
  process.nextTick(() => {
    return done(null, profile);
  })
}));

const app = express();
app.use(require('cookie-parser')());
app.use(require('express-session')({
  secret: process.env.COOKIE_SECRET || 'COOKIE_SECRET'
}));

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('index', { user: req.user });
});

app.get('/profile', isAuthenticated, (req, res) => {
  res.render('profile', { user: req.user });
});

app.get('/auth/yandex', passport.authenticate('yandex'));

app.get('/auth/yandex/callback',
  passport.authenticate('yandex', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/login');
  }
);

app.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) {
      return next(err);
    }
    req.session.destroy(err => {
      if (err) {
        return next(err);
      }
      res.clearCookie('connect.sid');
      res.redirect('/login');
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});