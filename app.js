'use strict';

const express = require('express');
const app = express();

const mongoose = require('mongoose');
const logger = require('morgan');
const bodyParser = require('body-parser');

const passport = require('./src/services/passport');
// Api Routes
const userRoutes = require('./src/routes/user');

mongoose.connect('mongodb://localhost/codingChallenge')

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(passport.initialize());

/* Your code */
app.use('/api', userRoutes);

// Handle errors
app.use(function(err, req, res, next) {
    res
      .status(err.status || 500)
      .json({
        error: err.message
      });
});

app.listen(3000, () => {
  console.log('Server started.');
});

module.exports = app;
