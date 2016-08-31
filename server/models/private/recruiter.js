'use strict';

const mongoose = require('mongoose');
let schema;

module.exports.schema = schema = new mongoose.Schema({

  email: {
    type: String,
    trim: true,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  newsletter: {
    jobs: {
      type: Boolean,
      default: true
    }
  },
  unsubscribe: {
    type: Boolean,
    default: false
  },
  enable: {
    type: Boolean,
    default: true
  }
});

module.exports.model = mongoose.model('recruiter', schema, 'recruiters');
