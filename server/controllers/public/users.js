'use strict';

const helpers = require('../helpers'),
  Model = require('../models/user').model,
  _ = require('lodash');

module.exports = class Workshops {

  static create(req, res, next) {
    Model.create(req.body, (err, doc) => {
      helpers.handleResponse(res, err, doc, next);
    });
  }

  static read(req, res, next) {
    let q = req.query;
    let findParams = {};
    let options = {};
    let displayable = {
      $or: [{
        display: {
          $exists: false
        }
      }, {
        display: true
      }]
    };

    if (q.limit) {
      options.limit = parseInt(q.limit, 10);
    }

    Model.find(_.merge(findParams, displayable), null, options)
      .lean().exec((err, docs) => {
        helpers.handleResponse(res, err, docs);
      });
  }

  static readById(req, res, next) {
    Model.findById(req.params.userId).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc);
    });
  }

  static readBySlug(req, res, next) {
    Model.findOne({
      url: req.params.userSlug
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc);
    });
  }

  static update(req, res, next) {
    delete req.body._id;
    Model.findByIdAndUpdate(req.params.userId, req.body, {
      new: true
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc, next);
    });
  }

  static delete(req, res, next) {
    Model.findByIdAndUpdate(req.params.userId, {
      $set: {
        display: false
      }
    }, {
      new: true
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc, next);
    });
  }
};
