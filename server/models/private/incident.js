'use strict';

const mongoose = require('mongoose');
const User = require('./user');
let schema;

module.exports.schema = schema = new mongoose.Schema({

  location: {
    type: mongoose.Schema.Types.Mixed
  },
  comuna: {
    type: String,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  token: {
    type: String,
    trim: true
  },
  title: {
    type: String,
    trim: true
  },
  body: {
    type: String,
    trim: true
  },
  responses: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    affirmative: {
      type: Boolean,
      default: true
    }
  }],
  enable: {
    type: Boolean,
    default: true
  },
  published: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports.model = mongoose.model('Incident', schema, 'incidents');