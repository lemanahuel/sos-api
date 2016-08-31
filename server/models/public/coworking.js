'use strict';

const mongoose = require('mongoose');
let schema;

module.exports.schema = schema = new mongoose.Schema({

  name: {
    type: String,
    trim: true,
    required: true
  },
  logo: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    trim: true
  },
  locations: [{
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
      required: true
    },
    address: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    alias: {
      type: String
    },
    days: {
      type: Array,
      required: true
    },
    startHourWeek: {
      type: Date,
      required: true
    },
    endHourWeek: {
      type: Date,
      required: true
    },
    startHourWeekend: {
      type: Date,
      required: true
    },
    endHourWeekend: {
      type: Date,
      required: true
    },
    emails: [{
      type: String
    }],
    phones: [{
      type: String
    }],
    images: [{
      type: String,
      trim: true
    }],
    rooms: [{
      name: {
        type: String
      },
      size: {
        type: Number
      },
      comment: {
        type: String
      }
    }],
    enable: {
      type: Boolean,
      default: true
    }
  }],
  display: {
    type: Boolean,
    default: true
  },
  published: {
    type: Boolean,
    default: false
  }
});

module.exports.model = mongoose.model('Coworking', schema, 'coworkings');
module.exports.locations = mongoose.model('Coworking.locations', schema, 'coworkings');
module.exports.rooms = mongoose.model('Coworking.locations.rooms', schema, 'coworkings');
