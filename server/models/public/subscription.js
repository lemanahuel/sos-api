'use strict';

const mongoose = require('mongoose');
let schema;

module.exports.schema = schema = new mongoose.Schema({

  name: {
    type: String,
    trim: true
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
  extra_data: mongoose.Schema.Types.Mixed,
  sendgrid: mongoose.Schema.Types.Mixed,
  closeio: mongoose.Schema.Types.Mixed,
  country: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    trim: true,
    required: true
  },
  utm_source: {
    type: String,
    trim: true
  },
  utm_medium: {
    type: String,
    trim: true
  },
  utm_term: {
    type: String,
    trim: true
  },
  utm_content: {
    type: String,
    trim: true
  },
  utm_campaign: {
    type: String,
    trim: true
  },
  display: {
    type: Boolean,
    default: true
  },
  newsletter: {
    nextCourses: {
      type: Boolean,
      default: true
    },
    jobs: {
      type: Boolean,
      default: true
    }
  },
  unsubscribe: {
    type: Boolean,
    default: false
  }
});

module.exports.model = mongoose.model('Subscriptions', schema, 'subscriptions');
