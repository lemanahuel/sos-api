'use strict';

const helpers = require('../helpers'),
  moment = require('moment-timezone'),
  timeZone = 'America/Argentina/Buenos_Aires',
  dateFormat = require('dateformat'),
  CareerModel = require('../models/career').model,
  LevelModel = require('../models/level').model,
  CamadaModel = require('../models/admin/camada').model,
  Model = require('../models/course').model,
  mailHelper = require('../helpers/mail'),
  _ = require('lodash');

module.exports = class Courses {

  static read(req, res, next) {
    let q = req.query;
    let findParams = {};
    let options = {};
    let displayable = {
      $or: [{
        display: {
          $exists: false
        }
      }, {
        display: true
      }]
    };

    if (q.country) {
      findParams.country = q.country;
    }

    if (q.startDate) {
      findParams.startDate = {
        $gte: q.startDate
      };
    }

    if (q.limit) {
      options.limit = parseInt(q.limit, 10);
    }

    Model.find(_.merge(findParams, displayable), null, options)
      .sort('startDate').populate('career level')
      .lean().exec((err, docs) => {
        helpers.handleResponse(res, err, docs);
      });
  }

  static readById(req, res, next) {
    Model.findById(req.params.courseId).populate('career level').lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc);
    });
  }

  static confirmCourseCoworking(req, res, next) {
    Model.findById(req.params.courseId).populate('career level').lean().exec((err, doc) => {
      let course = doc;
      course.startDate = dateFormat(course.startDate, 'dd-mm-yyyy');
      course.endDate = dateFormat(course.endDate, 'dd-mm-yyyy');
      course.hours = (course.startHour && course.endHour) ? moment.tz(course.startHour, timeZone).format('HH:mm') + ' - ' + moment.tz(course.endHour, timeZone).format('HH:mm') : course.hours;
      mailHelper.send({
        country: doc.country,
        toEmail: helpers.isProd() ? ['chris@coderhouse.com', 'stefy@coderhouse.com'] : 'it@coderhouse.com',
        subject: 'Confirmacion del nuevo curso',
        tpl: {
          path: './server/templates/coworking/confirm-new-course.html',
          params: {
            course: course,
            name: req.params.name.split('+').join(' '),
            address: req.params.address.split('+').join(' ')
          }
        }
      });

      res.redirect(helpers.domains().web + 'espacios/confirmacion/gracias');
    });
  }
};
