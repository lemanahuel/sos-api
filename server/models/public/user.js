'use strict';

const mongoose = require('mongoose');
let schema;

module.exports.schema = schema = new mongoose.Schema({

  name: {
    type: String,
    trim: true,
    required: true
  },
  email: {
    type: String,
    trim: true,
    required: true
  },
  password: {
    type: String,
    trim: true,
    required: true
  },
  rol: {
    type: Number,
    required: true
  },
  remember_token: {
    type: String,
    trim: true
  }

});

module.exports.model = mongoose.model('User', schema, 'users');
