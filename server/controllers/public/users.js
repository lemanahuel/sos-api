'use strict';

const helpers = require('../../helpers'),
  Model = require('../../models/private/user').model,
  _ = require('lodash');

module.exports = class Users {

  static create(req, res, next) {
    console.log('Users', req.body);

    if (req.body.comuna) {
      req.body.comuna = helpers.normalizeComuna(req.body.comuna);
    }

    Model.findOneAndUpdate({
      email: req.body && req.body.email
    }, req.body, {
      upsert: true,
      safe: true,
      new: true
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc, next);
    });
  }

  static list(req, res, next) {
    let findParams = {};

    if (req.query.volunteers) {
      findParams.isVolunteer = true;
    }

    Model.find(findParams).select('avatar').lean().exec((err, docs) => {
      helpers.handleResponse(res, err, docs);
    });
  }

  static read(req, res, next) {
    Model.findById(req.params.userId).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc);
    });
  }

  static update(req, res, next) {
    let body = req.body;
    if (req.body.user) {
      body = JSON.parse(req.body.user);
      if (body.comuna) {
        body.comuna = helpers.normalizeComuna(body.comuna);
      }
    }

    Model.findByIdAndUpdate(req.params.userId, body, {
      new: true
    }).lean().exec((err, doc) => {
      req.params.userId = doc._id;
      Users.read(req, res);
    });
  }
};