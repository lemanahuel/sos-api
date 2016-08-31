'use strict';

const helpers = require('../helpers'),
  CourseModel = require('../models/course').model,
  CoworkingModel = require('../models/coworking').model,
  CountryModel = require('../models/country').model,
  Model = require('../models/career').model,
  async = require('async'),
  _ = require('lodash');

module.exports = class Careers {

  static create(req, res, next) {
    helpers.handleResponse(res, null, {
      error: 'unsupported action.'
    }, next);
  }

  static read(req, res, next) {
    let country = req.query.country || 'ar';
    let displayable = {
      $or: [{
        display: {
          $exists: false
        }
      }, {
        display: true
      }]
    };
    let findParams = _.merge({
      country: country
    }, displayable);

    let select = req.query.fields ? req.query.fields.split(',').join(' ') : '';
    let levelSelect = req.query.levelFields ? req.query.levelFields.split(',').join(' ') : '';

    let cleanCourses = (courses) => {
      _.each(courses, (course) => {
        if (course && course.camada) {
          course.camada = course.camada.toString();
        }
      });
      return _.uniqBy(courses, 'camada');
    };

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


    CountryModel.findOne({
        code: country
      })
      .lean().exec((err, docCountry) => {
        let whereLevel = {
          countries: {
            '$in': [docCountry._id]
          }
        };
        Model.find(displayable)
          .sort('_id')
          .select(select)
          .populate({
            path: 'levels',
            model: 'Level',
            match: _.merge(displayable, whereLevel),
            select: levelSelect,
            options: {
              sort: 'id_level'
            }
          })
          .lean().exec((err, careers) => {
            if (!err) {
              async.each(careers, (career, cb1) => {
                CourseModel.find(_.merge({}, findParams, displayable, {
                    id_career: career.id_career,
                    id_level: 0
                  }))
                  .sort('startDate')
                  .populate('currency')
                  .lean().exec((err, careerCourses) => {
                    career.courses = cleanCourses(careerCourses);

                    if (career.levels) {
                      async.each(career.levels, (level, cb2) => {
                        CourseModel.find(_.merge({}, findParams, displayable, {
                            id_career: career.id_career,
                            id_level: {
                              $in: normalizeLevelId(level.id_level)
                            }
                          }))
                          .sort('startDate')
                          .populate('currency')
                          .lean().exec((err, levelCourses) => {
                            if (!err && levelCourses) {
                              level.courses = cleanCourses(levelCourses);
                            } else {
                              console.log(err);
                            }
                            cb2();
                          });
                      }, (err) => {
                        if (err) {
                          console.log(err);
                        }
                        cb1();
                      });
                    } else {
                      cb1();
                    }
                  });
              }, (err) => {
                if (err) {
                  console.log(err);
                }
                helpers.handleResponse(res, err, careers);
              });
            } else {
              helpers.handleResponse(res, err, careers);
            }
          });
      });

  }

  static readById(req, res, next) {
    Model.findById(req.params.careerId).populate({
      path: 'courses levels',
      populate: {
        path: 'courses',
        model: 'Course'
      }
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc);
    });
  }

  static readBySlug(req, res, next) {
    let country = req.query.country || 'ar';
    let displayable = {
      $or: [{
        display: {
          $exists: false
        }
      }, {
        display: true
      }]
    };
    let findParams = _.merge({
      country: country
    }, displayable);
    let select = req.query.fields ? req.query.fields.split(',').join(' ') : '';
    let levelSelect = req.query.levelFields ? req.query.levelFields.split(',').join(' ') : '';

    Model.findOne({
        url: req.params.careerSlug
      })
      .select(select)
      .populate({
        path: 'levels',
        model: 'Level',
        match: displayable,
        select: levelSelect,
        options: {
          sort: 'id_level'
        }
      }).lean().exec((err, career) => {
        if (!err && career) {
          CourseModel.find(_.merge({
              soldOut: false
            }, findParams, displayable, {
              id_career: career.id_career,
              id_level: 0
            }))
            .sort('startDate')
            .populate('currency')
            .lean().exec((err, courses) => {
              career.courses = courses;
              if (career.levels) {
                async.each(career.levels, (level, cb) => {
                  CourseModel.find(_.merge({
                      soldOut: false
                    }, findParams, displayable, {
                      id_career: career.id_career,
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
                  helpers.handleResponse(res, err, career, next);
                });
              } else {
                helpers.handleResponse(res, err, career, next);
              }
            });
        } else if (career && career.levels) {
          async.each(career.levels, (level, cb) => {
            CourseModel.find(_.merge({
                soldOut: false
              }, findParams, displayable, {
                id_career: career.id_career,
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
            helpers.handleResponse(res, err, career, next);
          });
        } else {
          helpers.handleResponse(res, err, career, next);
        }
      });
  }

  static update(req, res, next) {
    delete req.body._id;
    Model.findByIdAndUpdate(req.params.careerId, req.body, {
      new: true
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc, next);
    });
  }

  static delete(req, res, next) {
    Model.findByIdAndUpdate(req.params.careerId, {
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
