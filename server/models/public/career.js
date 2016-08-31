'use strict';

const mongoose = require('mongoose');
let schema;

module.exports.schema = schema = new mongoose.Schema({

  id_career: {
    type: String,
    trim: true,
    required: true
  },
  title: {
    type: String,
    trim: true,
    required: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  logo: {
    type: String,
    trim: true
  },
  flyer: {
    type: String,
    trim: true
  },
  program: {
    type: String,
    trim: true
  },
  levels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level'
  }],
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  calendar: [{
    _id: false,
    title: {
      type: String,
      trim: true
    },
    content: {
      type: String,
      trim: true
    }
  }],
  landing: {
    title: {
      type: String,
      trim: true
    },
    subtitle: {
      type: String,
      trim: true
    }
  },
  seo: {
    title: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  },
  bills: [{
    currency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Currency'
    },
    price: {
      type: Number,
      trim: true
    },
    quota: {
      type: Number,
      trim: true
    },
    priceQuota: {
      type: Number,
      trim: true
    },
    offerPriceDate: {
      type: Date,
      trim: true
    },
    offerPrice: {
      type: Number,
      trim: true
    },
    offerQuota: {
      type: Number,
      trim: true
    },
    offerPriceQuota: {
      type: Number,
      trim: true
    }
  }],
  display: {
    type: Boolean,
    default: true
  },
  published: {
    type: Boolean,
    default: true
  }
});

module.exports.model = mongoose.model('Career', schema, 'careers');
