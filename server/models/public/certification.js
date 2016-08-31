'use strict';

const mongoose = require('mongoose');
let schema;

module.exports.schema = schema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    required: true
  },
  camada: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Camada'
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
  },
  url: {
    type: String,
    trim: true
  },
  enable: {
    type: Boolean,
    default: true
  }

});

module.exports.model = mongoose.model('Certification', schema, 'certifications');
