'use strict';

const helpers = require('../../helpers'),
  leadHelper = require('../../helpers/lead'),
  coursesMapHelper = require('../../helpers/courses-map'),
  momentTz = require('moment-timezone'),
  mailHelper = require('../../helpers/mail'),
  CourseModel = require('../../models/course').model,
  CamadaModel = require('../../models/admin/camada').model,
  AdminUserModel = require('../../models/admin/admin_user').model,
  async = require('async'),
  _ = require('lodash');

let getDate = (date) => {
  return momentTz(date).tz('America/Argentina/Buenos_Aires').format('DD/MM/YYYY');
};
let getHour = (date) => {
  return momentTz(date).tz('America/Argentina/Buenos_Aires').format('HH:mm');
};

let sendInfoToStundent = (user, course) => {
  mailHelper.send({
    country: course.country,
    toEmail: user.email,
    subject: 'Pre-inscripcion de curso',
    tpl: {
      path: './server/templates/subscriptions/pre-inscription.html',
      params: {
        name: user.profile.first_name,
        email: user.email,
        course: {
          careerTitle: course.career ? course.career.title : '',
          levelTitle: course.level ? course.level.title : '',
          startDate: getDate(course.startDate),
          endDate: getDate(course.endDate),
          startHour: getHour(course.startHour),
          endHour: getHour(course.endHour),
          country: course.country,
          place: course.place,
          days: course.days,
          offerPrice: course.currency.symbol + ' ' + course.offerPrice + ' ' + course.currency.iso_code,
          offerPriceDate: getDate(course.offerPriceDate),
          offerExpired: new Date(course.offerPriceDate).getTime() < new Date().getTime(),
          price: course.currency.symbol + ' ' + course.price + ' ' + course.currency.iso_code,
          quota: course.quota,
          price_quota: course.currency.symbol + ' ' + course.price_quota + ' ' + course.currency.iso_code,
          plan: coursesMapHelper[course.level ? course.level.url : course.career.url].program
        },
        country: course.country,
        type: 'pre-inscription'
      }
    }
  });
};

let sendLead = (inscription, user, course) => {
  leadHelper.create({
    email: user.email,
    tel: user.phone,
    country: inscription.country,
    type: 'pre-inscription',
    name: user.profile.first_name,
    last_name: user.profile.last_name,
    doc: {
      titleCareer: course.career ? course.career.title : '',
      titleLevel: course.level ? course.level.title : '',
      urlMap: course.level ? course.level.url : course.career.url
    }
  });
};

module.exports = class Enrool {

  static create(req, res, next) {
    let inscription = req.body;
    AdminUserModel.findById(inscription.userId)
      .lean().exec((err, userDoc) => {
        if (!err && userDoc) {
          CourseModel.findById(inscription.courseId)
            .populate('career level currency')
            .lean().exec((err, courseDoc) => {
              if (!err && courseDoc) {
                CamadaModel.findById(courseDoc.camada).exec((err, camadaDoc) => {
                  if (camadaDoc.pendingStudents && camadaDoc.pendingStudents.indexOf(userDoc._id) === -1 && camadaDoc.students && camadaDoc.students.indexOf(userDoc._id) === -1) {
                    camadaDoc.pendingStudents.push(userDoc._id);
                    camadaDoc.save();
                  }
                  sendLead(inscription, userDoc, courseDoc);
                  sendInfoToStundent(userDoc, courseDoc);

                  helpers.handleResponse(res, err, {
                    success: true
                  });
                });
              } else {
                helpers.handleResponse(res, err, {
                  error: 'course-no-exists'
                }, next);
              }
            });
        } else {
          helpers.handleResponse(res, err, {
            error: 'user-no-exists'
          }, next);
        }
      });
  }

};
