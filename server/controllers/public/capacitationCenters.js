const helpers = require('../../helpers'),
  Model = require('../../models/private/capacitationCenter').model,
  _ = require('lodash');

module.exports = class CC {

  static list(req, res, next) {
    Model.find({
      enable: true
    }).lean().exec((err, docs) => {
      docs = _.map(docs, (doc) => {
        if (doc.location && doc.location.days) {
          if (doc.location.hours.from && doc.location.hours.to) {
            doc.hours = (new Date(doc.location.hours.from).getHours()) + ':00 - ' + (new Date(doc.location.hours.to).getHours()) + ':00';
          }
          if (doc.location.days.from && doc.location.days.to) {
            doc.days = doc.location.days.from + ' - ' + doc.location.days.to;
          }
        }
        return doc;
      });
      helpers.handleResponse(res, err, docs);
    });
  }

  static read(req, res, next) {
    console.log(req.params.ccId);
    Model.findById(req.params.ccId).lean().exec((err, doc) => {
      if (doc.location && doc.location.days) {
        if (doc.location.hours.from && doc.location.hours.to) {
          doc.hours = (new Date(doc.location.hours.from).getHours()) + ':00 - ' + (new Date(doc.location.hours.to).getHours()) + ':00';
        }
        if (doc.location.days.from && doc.location.days.to) {
          doc.days = doc.location.days.from + ' - ' + doc.location.days.to;
        }
      }
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