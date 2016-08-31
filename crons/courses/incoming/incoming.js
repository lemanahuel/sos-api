'use strict';

const dateFormat = require('dateformat');
const moment = require('moment');
const _ = require('lodash');
const async = require('async');
const db = require('mongoose');
const momentTz = require('moment-timezone');
const connections = require('../../connections');
const helpers = require('../../../server/helpers');
const MailHelper = require('../../../server/helpers/mail');
const StageModel = require('../../../server/models/admin/stage').model;
const CamadaModel = require('../../../server/models/admin/camada').model;
const ScheduleModel = require('../../../server/models/admin/admin_schedule').model;
const UsersModel = require('../../../server/models/admin/admin_user').model;
const ClassModel = require('../../../server/models/admin/class').model;
const CourseModel = require('../../../server/models/course').model;
const CoworkingModel = require('../../../server/models/coworking').model;
const CountryModel = require('../../../server/models/country').model;
const isProd = helpers.isProd();

let localTime = () => {
  let day = moment().tz('America/Argentina/Buenos_Aires');
  let start = day.format('YYYY-MM-DDT00:00:00Z');
  let end = day.add(7, 'days').format('YYYY-MM-DDT23:59:59Z');

  return {
    start: new Date(start).getTime(),
    end: new Date(end).getTime()
  };
};

let sendVerificationMail = () => {
  let camadas = _.map(_.sortBy(schedules, 'camada.id').reverse(), (schedule) => {
    return {
      id: schedule.camada.id,
      className: schedule.camada.class.name,
      students: schedule.camada.students.length
    };
  });

  MailHelper.send({
    toEmail: isProd ? ['it@coderhouse.com'] : 'it@coderhouse.com',
    subject: 'Verificacion de Inicio de cursos enviados',
    tpl: {
      path: './crons/feedbacks/feedback-verification.tpl.html',
      params: {
        camadas: camadas && camadas.length ? camadas : [{
          id: 0,
          className: 'No cursaron camadas hoy',
          students: 0
        }],
        date: dateFormat(date.start, 'dd-mm-yyyy')
      }
    }
  });
};

db.connect(connections.local, () => {
  console.log('START CONNECTION::', connections.local);
  let date = localTime();
  let where = {};
  where.startDate = {
    $gte: date.start,
    $lte: date.end
  };

  CourseModel.find(where)
    .populate({
      path: 'camada',
      model: 'Camada',
      populate: [{
        path: 'students',
        model: 'AdminUser'
      }, {
        path: 'teachers',
        model: 'AdminUser'
      }, {
        path: 'class',
        model: 'Class'
      }]
    })
    .lean().exec((err, courses) => {
      console.log('COURSES::', courses ? courses.length : 0);

      //user.Notifications {starter/incoming true para validar re-envios}
      //Validar camadas repetidas

      async.each(courses, (course, cb) => {
        if (course.camada && course.camada.id) {
          console.log(course.camada.students.length);
        }
      }, () => {
        if (err) console.log(err);
        console.log('FINISH');
        sendFeedbackVerificationMail();
      });
    });
});
