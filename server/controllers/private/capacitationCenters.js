'use strict';

const helpers = require('../../helpers'),
  Model = require('../../models/private/capacitationCenter').model,
  _ = require('lodash');

const ccs = [{
  _id: 2,
  user: {},
  name: 'Centro de capacitacion 2',
  description: 'Damos capacitaciones 2',
  url: 'https://www.voluntariosos.org',
  avatar: 'avatar.jpg',
  contact: {
    email: 'center@gmail.com',
    phone: 44810302
  },
  location: {
    address: {},
    hours: {
      from: new Date(),
      to: new Date()
    },
    days: {
      from: 1,
      to: 2
    }
  },
  courses: [{
    name: 'Curso de RPC 2',
    description: 'Descripcion del curso 2',
    url: 'https://www.voluntariosos.org',
    published: false
  }],
  enable: false,
  published: false
}];

module.exports = class CC {

  static create(req, res, next) {
    Model.create(req.body, (err, doc) => {
      helpers.handleResponse(res, err, doc, next);
    });
  }

  static list(req, res, next) {
    Model.find({
      enable: true
    }).lean().exec((err, docs) => {
      helpers.handleResponse(res, err, docs);
    });
  }

  static read(req, res, next) {
    Model.findById(req.params.ccId).lean().exec((err, doc) => {
      helpers.handleResponse(res, null, doc);
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

  static delete(req, res, next) {
    Model.findByIdAndUpdate(req.params.ccId, {
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