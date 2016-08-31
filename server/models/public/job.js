'use strict';

const mongoose = require('mongoose');
let schema;

module.exports.schema = schema = new mongoose.Schema({

  company: {
    name: {
      type: String,
      trim: true,
      required: true
    },
    description: {
      type: String,
      trim: true
    }
  },
  contact: {
    type: String,
    trim: true,
    required: true
  },
  type: {
    type: String,
    trim: true,
    required: true
  },
  category: {
    type: String,
    trim: true,
    required: true,
    default: 'development'
  },
  modality: {
    type: String,
    trim: true,
    required: true,
    default: 'present'
  },
  location: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  origin_country: {
    type: String,
    trim: true,
    required: true,
    default: 'ar'
  },
  title: {
    type: String,
    trim: true,
    required: true
  },
  description: {
    type: String,
    trim: true,
    required: true
  },
  requirements: {
    type: String,
    trim: true
  },
  display: {
    type: Boolean,
    default: true
  },
  published: {
    type: Boolean,
    default: true
  },
  url: {
    type: String,
    trim: true,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  postulations: [{
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
      type: String,
      trim: true
    },
    cv_online: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    },
    created: {
      type: Date,
      default: Date.now
    }
  }]
});

module.exports.model = mongoose.model('job', schema, 'jobs');
