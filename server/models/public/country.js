'use strict';

const mongoose = require('mongoose');
let schema;

module.exports.schema = schema = new mongoose.Schema({

  name: {
    type: String,
    trim: true,
    required: true
  },
  code: {
    type: String,
    trim: true,
    required: true
  },
  enable: {
    type: Boolean,
    default: true
  }

});

module.exports.model = mongoose.model('Country', schema, 'countries');
