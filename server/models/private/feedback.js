'use strict';

const mongoose = require('mongoose');
const User = require('./user');
const Incident = require('./incident');
let schema;

module.exports.schema = schema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  capacitationCenter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'capacitationCenter'
  },
  incident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
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