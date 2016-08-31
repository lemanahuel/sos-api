'use strict';

const helpers = require('../helpers'),
  Model = require('../models/currency').model;

module.exports = class Currency {

  static create(req, res, next) {
    var params = req.body;
    delete params._id;
    Model.create(params, (err, doc) => {
        helpers.handleResponse(res, err, doc, next);
    });
  }

  static read(req, res, next) {
    Model.find().lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc);
    });
  }

  static readById(req, res, next) {
    Model.findById(req.params.currencyId).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc);
    });
  }

  static update(req, res, next) {
    Model.findByIdAndUpdate(req.params.currencyId, req.body, {
      new: true
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc, next);
    });
  }

  static delete(req, res, next) {
    Model.findByIdAndRemove(req.params.currencyId).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc, next);
    });
  }

};
