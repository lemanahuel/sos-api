'use strict';

const mongoose = require('mongoose');
let schema;

module.exports.schema = schema = new mongoose.Schema({

  career: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Career'
  },
  countries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country'
  }],
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  id_career: {
    type: String,
    trim: true,
    required: true
  },
  id_level: {
    type: String,
    trim: true,
    required: true
  },
  title: {
    type: String,
    trim: true
  },
  subtitle: {
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
  class: {
    type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
  },
  detail: {
    _id: false,
    count_hours: {
      type: Number,
      trim: true
    },
    count_projects: {
      type: Number,
      trim: true
    },
    workshops: {
      type: Number,
      trim: true
    },
    practical_work: {
      type: Number,
      trim: true
    },
    weeks: {
      type: Number,
      trim: true
    },
    prerequisites: {
      type: String,
      trim: true
    },
    description_all: {
      type: String,
      trim: true
    },
    unities: [{
      _id: false,
      title: {
        type: String,
        trim: true
      },
      list: mongoose.Schema.Types.Mixed
    }]
  },
  tecnologies: [{
    _id: false,
    title: {
      type: String,
      trim: true
    }
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

module.exports.model = mongoose.model('Level', schema, 'levels');
