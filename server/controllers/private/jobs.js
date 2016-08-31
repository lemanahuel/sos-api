'use strict';

const helpers = require('../../helpers'),
  Model = require('../../models/job').model;

let encodeUrl = (title) => {
  let code = String(new Date().getTime() * 3).substr(8);
  return code + '-' + (title.replace(/[^a-z0-9]/gi, '-').toLowerCase());
};

module.exports = class Jobs {

  static create(req, res, next) {
    var params = req.body;
    params.title = params.title || '';
    params.url = encodeUrl(params.title);
    Model.create(params, (err, doc) => {
      helpers.handleResponse(res, err, doc, next);
    });
  }

  static read(req, res, next) {
    Model.find({
      $or: [{
        display: true
      }, {
        display: {
          $exists: false
        }
      }]
    }).sort('-created').lean().exec((err, docs) => {
      helpers.handleResponse(res, err, docs);
    });
  }

  static readById(req, res, next) {
    Model.findById(req.params.jobId).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc);
    });
  }

  static update(req, res, next) {
    var params = req.body;
    params.title = params.title || '';
    params.url = encodeUrl(params.title);
    Model.findByIdAndUpdate(req.params.jobId, params, {
      new: true
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc, next);
    });
  }

  static delete(req, res, next) {
    Model.findByIdAndUpdate(req.params.jobId, {
      $set: {
        display: false,
        published: false
      }
    }, {
      new: true
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc, next);
    });
  }

};
