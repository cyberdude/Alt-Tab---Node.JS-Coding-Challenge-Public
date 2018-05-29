'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');

const ExtractJWT = passportJWT.ExtractJwt;
const JWTStrategy   = passportJWT.Strategy;

const UserModel = require('../models/user');

passport.use(new LocalStrategy({
    usernameField: 'email'
  }, (username, password, done) => {
    return UserModel
      .findOne({ email: username })
      .select('+password')
      .then(user => {
        if (!user) {
          done(null, false, {
            message: 'Incorrect email.'
          });
          return;
        }

        user.comparePassword(password, function(err, answer){
          if (err) {
            console.error(err);
            done('Error checking password.', null);
            return;
          }

          if (!answer) {
            done(null, false, {
              message: 'Your e-mail or password is incorrect.'
            });
            return;
          }
          user.password = null;

          done(null, user);
          return;
      });
    })
    .catch(err => {
      if (err) {
        console.error(err);
        done(err);
        return;
      }
    });
  })
);

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey   : 'jwt_secret_env'
  },
  function (jwtPayload, cb) {
    const { _id, tokenHash } = jwtPayload;

    return UserModel
      .findOne({
        _id: _id,
        tokenHash: tokenHash
      })
      .then(user => {
        return cb(null, user);
      })
      .catch(err => {
        return cb(err);
      });
  })
);

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(_id, done) {
  return UserModel
    .findById(_id)
    .then(user => {
      done(null, user);
      return;
    })
    .catch(err => {
      done(err);
      return;
    });
});

module.exports = passport;
