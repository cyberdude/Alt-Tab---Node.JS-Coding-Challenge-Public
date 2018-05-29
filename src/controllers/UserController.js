'use strict';

const passport = require('passport');
const UserModel = require('../models/user');
const UserController = {};
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function generateHash (user) {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(48, (err, buffer) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(buffer.toString('hex'));
    });
  })
}

// Registers a new user
UserController.registerNew = function (req, res, next) {
  const userData = req.body;

  const user = new UserModel(userData);

  user.save(err => {
    if (err) {
      const _err = {
        status: 400,
        message: ''
      }

      _err.message = (err.code === 11000)
        ? 'Email is already in use.'
        : err.message;

      next(_err);
      return;
    };

    UserController.loginUser(req, res, next);
  });
};

// Logins user with local passport strategy
UserController.loginUser = function (req, res, next) {
  passport.authenticate('local', (err, user) => {
    if (err) {
      console.error('Error trying to aunthenticate user.');
      res.send(403, { error : 'Error authenticating user.' });
      return;
    }
    if (!user) {
      res.send(403, { error: 'Your e-mail or password is incorrect.' });
      return;
    }

    req.login(user, { session: false }, (err) => {
      if (err) {
        console.error(err)
        res.send(403, {error: 'Fail to get user.'});
        return;
      }
  
      if (user.password){
        console.error('CRITICAL: Login was returning the password.')
        res.json(403, { error: 'Error signing you in. Please try again soon.'});
        return;
      }
      delete user._doc.password;

      const token = jwt.sign(JSON.stringify(user),
        'jwt_secret_env'
      );
      const statusCode = req.url.indexOf('/login') > -1
        ? 200
        : 201;

      res
        .status(statusCode)
        .json({
        user, token
      });
    });
  })(req, res, next);
};

UserController.getProfile = function (req, res, next) {
  res.json(req.user);
};

UserController.logout = function (req, res, next) {
  return generateHash()
    .then(hash => {
      return UserModel
        .findById(req.user._id)
        .then(user => {
          user.tokenHash = hash
          return user.save();
        })
    })
    .catch(err => {
      console.error(err);
      next({
        status: 500,
        message: 'Unknown error'
      })
    })
    .then(() => {
      res.json({
        status : 'OK'
      });
      req.logout();
    });
  
};

module.exports = UserController;
