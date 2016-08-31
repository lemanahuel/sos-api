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
  count_hours: {
    type: Number,
    trim: true
  },
  count_projects: {
    type: Number,
    trim: true
  },
  workshops: {
    type: Number,
    trim: true
  },
  practical_work: {
    type: Number,
    trim: true
  },
  weeks: {
    type: Number,
    trim: true
  },
  prerequisites: {
    type: String,
    trim: true
  },
  description_all: {
    type: String,
    trim: true
  }
});

module.exports.model = mongoose.model('Details', schema, 'details');
