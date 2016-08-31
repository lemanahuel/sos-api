'use strict';

const mongoose = require('mongoose');
let schema;

module.exports.schema = schema = new mongoose.Schema({

  name: {
    type: String,
    trim: true,
    required: true
  },
  symbol: {
    type: String,
    trim: true,
    required: true
  },
  iso_code: {
    type: String,
    trim: true,
    required: true
  },
  decimals: {
    type: String,
    trim: true,
    required: true
  },
  symbol_position: {
    type: String,
    trim: true,
    required: true
  }
});

module.exports.model = mongoose.model('Currency', schema, 'currencies');