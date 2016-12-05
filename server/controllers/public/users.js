'use strict';

const helpers = require('../../helpers'),
  Model = require('../../models/private/user').model,
  _ = require('lodash');

module.exports = class Users {

  static create(req, res, next) {
    console.log('Users', req.body);
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
    let findParams = {
      enable: true
    };

    if (req.query.volunteers) {
      findParams.isVolunteer = true;
    } else {
      findParams.isVolunteer = {
        $or: [{
          isVolunteer: {
            $exists: false
          }
        }, {
          isVolunteer: false
        }]
      };
    }

    Model.find(findParams).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc);
    });
  }

  static read(req, res, next) {
    Model.findById(req.params.userId).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc);
    });
  }

  static update(req, res, next) {
    delete req.body._id;
    console.log(req.params.userId, req.body);

    Model.findByIdAndUpdate(req.params.userId, req.body, {
      new: true
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc, next);
    });
  }
};