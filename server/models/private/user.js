'use strict';

const mongoose = require('mongoose');
let schema;

module.exports.schema = schema = new mongoose.Schema({

  dni: {
    type: Number
  },
  email: {
    type: String,
    trim: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    trim: true
  },
  bday: {
    type: Date
  },
  phone: {
    type: Number
  },
  pass: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    trim: true
  },
  isVolunteer: {
    type: Boolean,
    default: false
  },
  comuna: {
    type: String,
    trim: true
  },
  cartifications: [{
    title: {
      type: String,
      trim: true
    },
    number: {
      type: String,
      trim: true
    },
    byCenter: {
      type: String,
      trim: true
    },
    date: {
      type: Date
    }
  }],
  settings: {},
  notifications: {
    sleeptime: [{
      from: {
        type: Date
      },
      to: {
        type: Date
      },
      date: {
        type: Date
      }
    }],
    unsubscribe: {
      type: Boolean,
      default: false
    }
  }
});

module.exports.model = mongoose.model('Users', schema, 'users');