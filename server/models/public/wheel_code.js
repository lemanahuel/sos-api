'use strict';

const mongoose = require('mongoose');
let schema;

module.exports.schema = schema = new mongoose.Schema({

  id: {
    type: Number
  },
  code: {
    type: String,
    trim: true,
    required: true
  },
  used: {
    type: Boolean
  },
  test: {
    type: Boolean
  },
  multiuser: {
    type: Boolean
  },
  country: {
    type: String,
    default: 'ar'
  }


});

module.exports.model = mongoose.model('Wheel_code', schema, 'wheel_code');
