'use strict';

const mongoose = require('mongoose');
let schema;

module.exports.schema = schema = new mongoose.Schema({

  name: {
    type: String,
    trim: true,
    required: true
  },
  img_description: {
    type: String,
    trim: true
  },
  img: {
    type: String,
    trim: true
  },
  contact: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  display: {
    type: Boolean
  },
  published: {
    type: Boolean
  }

});

module.exports.model = mongoose.model('Company', schema, 'companies');