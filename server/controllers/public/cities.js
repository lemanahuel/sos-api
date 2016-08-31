'use strict';

const helpers = require('../helpers'),
  _ = require('lodash'),
  Model = require('../models/city').model;

module.exports = class Country {

  static create(req, res, next) {
    Model.create(req.body, (err, doc) => {
      helpers.handleResponse(res, err, doc, next);
    });
  }

  static list(req, res, next) {
    let displayable = {
      $or: [{
        enable: {
          $exists: false
        }
      }, {
        enable: true
      }]
    };
    Model.find(displayable).populate({
      path: 'country',
      model: 'Country'
    }).lean().exec((err, docs) => {
      helpers.handleResponse(res, err, docs);
    });
  }

  static read(req, res, next) {
    Model.findById(req.params.cityId).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc);
    });
  }

  static update(req, res, next) {
    Model.findByIdAndUpdate(req.params.cityId, req.body, {
      new: true
    }).populate('country').lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc, next);
    });
  }

  static delete(req, res, next) {
    Model.findByIdAndUpdate(req.params.cityId, {
      $set: {
        enable: false
      }
    }, {
      new: true
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc, next);
    });
  }
};
