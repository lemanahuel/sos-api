'use strict';

const helpers = require('../helpers'),
  Model = require('../models/workshop').model,
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

    //Workshops.setSearchParams(q, findParams, options);

    if (q.fields) {
      options.select = q.fields ? q.fields.split(',').join(' ') : '';
    }

    // if (q.limit) {
    //   options.limit = parseInt(q.limit, 10);
    // }

    if (q.country) {
      findParams.country = q.country;
    }

    if (q.country) {
      findParams.date = {
        $gte: q.startDate
      };
    }

    Model.find(findParams, null, options)
      .sort('date')
      .lean().exec((err, docs) => {
        if (q.startDate) {
          docs = _.filter(docs, (doc) => {
            return new Date(doc.date).getTime() >= q.startDate ? doc : false;
          });
        }
        helpers.handleResponse(res, err, docs);
      });
  }

  static readById(req, res, next) {
    Model.findById(req.params.workshopId).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc);
    });
  }

  static readBySlug(req, res, next) {
    Model.findOne({
      url: req.params.workshopSlug
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc);
    });
  }

  static update(req, res, next) {
    delete req.body._id;
    Model.findByIdAndUpdate(req.params.workshopId, req.body, {
      new: true
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc, next);
    });
  }

  static delete(req, res, next) {
    Model.findByIdAndUpdate(req.params.workshopId, {
      $set: {
        display: false
      }
    }, {
      new: true
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc, next);
    });
  }

  static setSearchParams(q, findParams, options) {
    findParams.$and = [];

    if (q.startDate) {
      findParams.$and.push({
        $or: [{
          date: {
            $gte: q.startDate
          }
        }, {
          date: {
            $exists: false
          }
        }]
      });

      // findParams.$and.push({
      //   $or: [{
      //     display: {
      //       $exists: false
      //     }
      //   }, {
      //     display: true
      //   }]
      // });
    }

    // if (q.country && q.startDate) {
    //   findParams.$and.push({
    //     published: true
    //   });
    // }

    if (q.country) {
      findParams.country = q.country;
    }

    // if (q.limit) {
    //   options.limit = parseInt(q.limit, 10);
    // }

    if (!findParams.$and.length) {
      delete findParams.$and;
    }
  }
};
