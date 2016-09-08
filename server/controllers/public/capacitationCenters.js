'use strict';

const helpers = require('../helpers'),
  Model = require('../models/private/capacitationCenter').model,
  _ = require('lodash');

module.exports = class CC {

  static list(req, res, next) {
    Model.find().lean().exec((err, docs) => {
      helpers.handleResponse(res, err, docs);
    });
  }

  static read(req, res, next) {
    Model.findById(req.params.ccId).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc);
    });
  }

  static readBySlug(req, res, next) {
    Model.findOne({
      url: req.params.ccSlug
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc);
    });
  }

  static update(req, res, next) {
    delete req.body._id;

    Model.findByIdAndUpdate(req.params.ccId, req.body, {
      new: true
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc, next);
    });
  }
};
