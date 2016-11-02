'use strict';

const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy;

module.exports = (app) => {

  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, (email, password, done) => {

    User.findOne({
      email: email
    }).exec((err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, {
          message: 'Invalid'
        });
      }
      if (!user.authenticate(password)) {
        return done(null, false, {
          message: 'Invalid'
        });
      }
      return done(null, user);
    });
  }));

  app.use(passport.initialize());

};