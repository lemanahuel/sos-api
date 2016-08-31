'use strict';

const mongoose = require('mongoose');
let schema;

module.exports.schema = schema = new mongoose.Schema({

  id: {
    type: Number
  },
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    required: true
  },
  phone: {
    type: String
  },
  code_id: {
    type: mongoose.Schema.Types.ObjectId
  },
  prize_id: {
    type: Number
  },
  confirmed: {
    type: Boolean
  },
  country: {
    type: String,
    trim: true,
    required: true
  }

});

module.exports.model = mongoose.model('Wheel_player', schema, 'wheel_player');
