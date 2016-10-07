'use strict';

const mongoose = require('mongoose');
const User = require('./user');
let schema;

module.exports.schema = schema = new mongoose.Schema({

  location: {
    type: mongoose.Schema.Types.Mixed
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  responses: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    affirmative: {
      type: Boolean,
      default: false
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