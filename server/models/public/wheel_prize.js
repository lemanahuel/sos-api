'use strict';

const mongoose = require('mongoose');
let schema;

module.exports.schema = schema = new mongoose.Schema({

  id: {
    type: Number
  },
  name: {
    type: String,
    trim: true,
    required: true
  },
  quantity: {
    type: String,
    trim: true,
    required: true
  },
  quantity_used: {
    type: Number
  }
});

module.exports.model = mongoose.model('Wheel_prize', schema, 'wheel_prize');
