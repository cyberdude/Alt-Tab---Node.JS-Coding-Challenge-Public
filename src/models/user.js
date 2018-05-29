'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bcrypt = require('bcrypt');

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 2
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  },
  password: {
    type: String,
    required: true,
    select: false,
    minlength: 6
  },
  tokenHash: {
    type: String
  }
});

UserSchema.pre('save', function (next) {
  const user = this;

  if (!user.password) {
    next();
    return;
  }

  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) {
          console.error(err);
          next(err);
          return;
        }

        user.password = hash;
        next();
    });
  });

});

UserSchema.methods = {
  comparePassword : function (password, cb) {
    bcrypt.compare(password, this.password, (err, res) => {
    if (err) {
      cb(err);
      return;
    }

    cb(null, res);
  });
  }
};

const User = mongoose.model('User', UserSchema);

module.exports = User