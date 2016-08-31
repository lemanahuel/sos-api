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
    ref: 'Level'
  },
  id_course: {
    type: String,
    trim: true
  },
  id_career: {
    type: String,
    trim: true,
    required: true
  },
  id_level: {
    type: String,
    trim: true,
    required: true
  },
  mode: {
    type: String,
    trim: true,
    required: true
  },
  place: {
    type: String,
    trim: true
  },
  camada: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Camada'
  },
  coworking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coworking'
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coworking.locations'
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coworking.locations.rooms'
  },
  days: {
    type: String,
    trim: true
  },
  hours: {
    type: String,
    trim: true
  },
  fromDay: {
    type: Number
  },
  toDay: {
    type: Number
  },
  startHour: {
    type: Date,
    trim: true
  },
  endHour: {
    type: Date,
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
    trim: true,
    required: true
  },
  price_quota: {
    type: String,
    trim: true
  },
  currency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Currency'
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
    trim: true
  },
  display: {
    type: Boolean,
    default: true
  },
  soldOut: {
    type: Boolean,
    default: false
  },
  round: {
    type: String,
    trim: true,
    default: 'night'
  }
});

module.exports.model = mongoose.model('Course', schema, 'courses');
