'use strict';

const mongoose = require('mongoose');
let schema;

module.exports.schema = schema = new mongoose.Schema({

  questions: [{
    title: {
      type: String,
      trim: true
    },
    answers: [{
      value: {
        type: String,
        trim: true
      },
      correct: {
        type: Boolean,
        default: false
      }
    }]
  }],
  enable: {
    type: Boolean,
    default: true
  },
  published: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports.model = mongoose.model('Quiz', schema, 'quices');