const helpers = require('../../helpers'),
  Model = require('../../models/private/capacitationCenter').model,
  _ = require('lodash');

module.exports = class CC {

  static list(req, res, next) {
    Model.find({
      enable: true
    }).lean().exec((err, docs) => {
      helpers.handleResponse(res, err, docs);
    });
  }

  static read(req, res, next) {
    console.log(req.params.ccId);
    Model.findById(req.params.ccId).lean().exec((err, doc) => {
      console.log(doc);
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