'use strict';

const mongoose = require('mongoose');
let schema;

module.exports.schema = schema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  text: {
    type: String,
    trim: true
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

module.exports.model = mongoose.model('Testimony', schema, 'testimonies');