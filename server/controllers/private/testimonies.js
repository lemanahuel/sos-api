'use strict';

const helpers = require('../../helpers'),
  Model = require('../../models/private/testimony').model,
  _ = require('lodash');

module.exports = class Incidents {

  static create(req, res, next) {
    Model.create(req.body, (err, doc) => {
      helpers.handleResponse(res, err, doc, next);
    });
  }

  static list(req, res, next) {
    Model.find({
      enable: true
    }).lean().sort('-createdAt').exec((err, docs) => {
      helpers.handleResponse(res, err, docs);
    });
  }

  static read(req, res, next) {
    Model.findById(req.params.testimonyId).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc);
    });
  }

  static update(req, res, next) {
    delete req.body._id;
    Model.findByIdAndUpdate(req.params.testimonyId, req.body, {
      new: true
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc, next);
    });
  }

  static delete(req, res, next) {
    Model.findByIdAndUpdate(req.params.testimonyId, {
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