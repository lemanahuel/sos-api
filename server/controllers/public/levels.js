'use strict';

const helpers = require('../helpers'),
  _ = require('lodash'),
  async = require('async'),
  CourseModel = require('../models/course').model,
  CareerModel = require('../models/career').model,
  Model = require('../models/level').model;

module.exports = class Levels {

  static create(req, res, next) {
    Model.create(req.body, (err, level) => {
      helpers.handleResponse(res, err, level, next);
    });
  }

  static read(req, res, next) {
    let q = req.query;
    let findParams = {};
    let displayable = {
      $or: [{
        display: {
          $exists: false
        }
      }, {
        display: true
      }]
    };
    let select = req.query.fields ? req.query.fields.split(',').join(' ') : '';

    if (q.country) {
      findParams.country = q.country;
    }
    if (q.startDate) {
      findParams.startDate = {
        $gte: q.startDate
      };
    }

    Model.find(displayable)
      .sort('id_level')
      .select(select)
      .lean().exec((err, levels) => {
        async.each(levels, (level, cb) => {
          CourseModel.find(_.merge({}, findParams, displayable, {
              id_level: level.id_level
            }))
            .sort('startDate')
            .populate('currency')
            .lean().exec((err, courses) => {
              if (!err) {
                level.courses = courses;
              } else {
                console.log(err);
              }
              cb();
            });
        }, (err) => {
          if (err) {
            console.log(err);
          }
          helpers.handleResponse(res, err, levels);
        });
      });
  }

  static readById(req, res, next) {
    Model.findById(req.params.levelId).populate('career courses').lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc);
    });
  }

  static readBySlug(req, res, next) {
    let q = req.query;
    let findParams = {
      soldOut: false
    };
    let displayable = {
      $or: [{
        display: {
          $exists: false
        }
      }, {
        display: true
      }]
    };
    let select = req.query.fields ? req.query.fields.split(',').join(' ') : '';

    if (q.country) {
      findParams.country = q.country;
    }
    if (q.startDate) {
      findParams.startDate = {
        $gte: q.startDate
      };
    }

    let normalizeLevelId = (id) => {
      let ids = null;

      switch (parseInt(id, 10)) {
      case 1:
      case 4:
      case 7:
        ids = [1, 4, 7];
        break;
      case 2:
      case 5:
      case 8:
        ids = [2, 5, 8];
        break;
      default:
        ids = [id];
      }
      return ids;
    };

    Model.findOne({
        url: req.params.levelSlug
      })
      .select(select)
      .sort('id_level')
      .lean().exec((err, doc) => {
        if (!err && doc) {
          findParams.id_level = {
            $in: normalizeLevelId(doc.id_level)
          };

          CourseModel.find(_.merge(findParams, displayable))
            .sort('startDate')
            .populate('currency')
            .lean().exec((err, courses) => {
              if (!err && courses) {
                _.each(courses, (course) => {
                  if (course && course.camada) {
                    course.camada = course.camada.toString();
                  }
                });
                doc.courses = _.uniqBy(courses, 'camada');
              } else {
                console.log(err);
              }
              helpers.handleResponse(res, err, doc);
            });
        } else {
          helpers.handleResponse(res, err, doc);
        }
      });
  }

  static update(req, res, next) {
    delete req.body._id;
    Model.findByIdAndUpdate(req.params.levelId, req.body, {
      new: true
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc, next);
    });
  }

  static delete(req, res, next) {
    Model.findByIdAndUpdate(req.params.levelId, {
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
