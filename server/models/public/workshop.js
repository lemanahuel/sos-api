'use strict';

const mongoose = require('mongoose');
let schema;

module.exports.schema = schema = new mongoose.Schema({

  title: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    trim: true
  },
  url_inscription: {
    type: String,
    trim: true
  },
  tecnology: {
    type: String,
    trim: true
  },
  short_description: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  background: {
    type: String,
    trim: true
  },
  logo: {
    type: String,
    trim: true
  },
  images: {
    type: String,
    trim: true
  },
  date: {
    type: Date
  },
  start_hour: {
    type: Date
  },
  end_hour: {
    type: Date
  },
  place: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    trim: true
  },
  learn: [{
    _id: false,
    description: {
      type: String,
      trim: true
    }
  }],
  requirements: [{
    _id: false,
    description: {
      type: String,
      trim: true
    }
  }],
  teachers: [{
    _id: false,
    name: {
      type: String,
      trim: true,
      required: true
    },
    profession: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    image: {
      type: String,
      trim: true
    }
  }],
  bring_to_home: [{
    image: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  }],
  soldOut: {
    type: Boolean,
    default: false
  },
  display: {
    type: Boolean,
    default: true
  },
  published: {
    type: Boolean,
    default: false
  }
});

module.exports.model = mongoose.model('Workshops', schema, 'workshops');
