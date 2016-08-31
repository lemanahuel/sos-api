'use strict';

const helpers = require('../../helpers');
const Model = require('../../models/admin/admin_user').model;

module.exports = class Auth {

  static signin(req, res, next) {
    Model.findOne({
      email: req.body.email
    }).lean().exec((err, doc) => {
      if (!err && !doc) {
        req.body.rol = 10;
        Model.create(req.body, (err, doc) => {
          helpers.handleResponse(res, err, doc);
        });
      } else if (doc) {
        helpers.handleResponse(res, err, {
          error: 'email-already-exists'
        }, next);
      } else if (err) {
        helpers.handleResponse(res, err, {
          error: 'unsupported action.'
        }, next);
      } else {
        res.send({
          error: 'could not signin'
        });
      }
    });
  }

  static login(req, res, next) {
    Model.findOne({
      email: req.body.email
    }).lean().exec((err, doc) => {
      if (!err && doc) {
        helpers.handleResponse(res, err, doc);
      } else {
        helpers.handleResponse(res, {
          error: 'could not login'
        }, doc);
      }
    });
  }

  static logout(req, res, next) {
    req.session.destroy();
    res.send({
      msg: 'user logged out'
    });
  }

  static getToken(req, res, next) {
    res.send({
      token: helpers.createToken('coderhouse')
    });
  }
};
