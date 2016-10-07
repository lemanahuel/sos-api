'use strict';

const mongoose = require('mongoose');
let schema;

module.exports.schema = schema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    trim: true
  },
  contact: {
    email: {
      type: String
    },
    phone: {
      type: String
    }
  },
  location: {
    address: {
      type: mongoose.Schema.Types.Mixed
    },
    hours: {
      from: {
        type: Date
      },
      to: {
        type: Date
      }
    },
    days: {
      from: {
        type: Number
      },
      to: {
        type: Number
      }
    }
  },
  courses: [{
    name: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    url: {
      type: String,
      trim: true
    },
    published: {
      type: Boolean,
      default: false
    }
  }],
  enable: {
    type: Boolean,
    default: true
  },
  published: {
    type: Boolean,
    default: false
  }
});

module.exports.model = mongoose.model('CapacitationCenter', schema, 'capacitation-center');