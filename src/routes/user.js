'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const passportMiddle = passport.authenticate('jwt', {
  session: false
});
const UserController = require('../controllers/UserController.js')

router.post('/register', UserController.registerNew);
router.post('/login', UserController.loginUser);
router.post('/logout', passportMiddle, UserController.logout);

router.get('/profile',
  passportMiddle,
  UserController.getProfile
);

module.exports = router;
