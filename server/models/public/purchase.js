'use strict';

const mongoose = require('mongoose');
let schema;

module.exports.schema = schema = new mongoose.Schema({

  name: {
    type: String,
    trim: true,
    required: true
  },
  last_name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  title: {
    type: String,
    trim: true
  },
  know: {
    type: String,
    trim: true
  },
  gateway: {
    type: String,
    trim: true
  },
  pay: {
    type: String,
    trim: true
  },
  way_to_pay: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true,
    required: true
  },
  id_course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  unit_price: {
    type: String,
    trim: true
  },
  promo_code: {
    type: String,
    trim: true
  },
  currency_id: {
    type: String,
    trim: true
  },
  bill: {
    full_name: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    cuil: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      trim: true
    }
  }
});

module.exports.model = mongoose.model('Purchase', schema, 'purchases');
