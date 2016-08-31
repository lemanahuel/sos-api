'use strict';

const mongoose = require('mongoose');
let schema;

module.exports.schema = schema = new mongoose.Schema({

  career: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Career'
  },
  level: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Levels'
  },
  mode: {
    type: String,
    trim: true
  },
  place: {
    type: String,
    trim: true
  },
  days: {
    type: String,
    trim: true
  },
  hours: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    trim: true
  },
  endDate: {
    type: Date,
    trim: true
  },
  quota: {
    type: String,
    trim: true
  },
  price_quota: {
    type: String,
    trim: true
  },
  price: {
    type: String,
    trim: true
  },
  offerPriceDate: {
    type: String,
    trim: true
  },
  offerPrice: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true,
    required: true
  }

});

module.exports.model = mongoose.model('Schedule', schema, 'schedules');
