'use strict';

const helpers = require('../../helpers'),
  Model = require('../../models/private/user').model,
  _ = require('lodash');

module.exports = class Users {

  static create(req, res, next) {
    Model.create(req.body, (err, doc) => {
      helpers.handleResponse(res, err, doc, next);
    });
  }

  static read(req, res, next) {
    let q = req.query;
    let findParams = {};
    let options = {};

    if (q.limit) {
      options.limit = parseInt(q.limit, 10);
    }

    if (q.admin) {
      findParams.isAdmin = true;
    }

    if (q.isVolunteer) {
      findParams.isVolunteer = true;
    }

    Model.find(findParams, null, options)
      .lean().exec((err, docs) => {
        helpers.handleResponse(res, err, docs);
      });
  }

  static readById(req, res, next) {
    Model.findById(req.params.userId).lean().exec((err, doc) => {
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
        enable: false
      }
    }, {
      new: true
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc, next);
    });
  }
};