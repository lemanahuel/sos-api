'use strict';

const helpers = require('../../helpers'),
  MailHelper = require('../../helpers/mail'),
  isProd = helpers.isProd(),
  async = require('async'),
  moment = require('moment-timezone'),
  dateFormat = require('dateformat'),
  _ = require('lodash'),
  Model = require('../../models/course').model,
  CareerModel = require('../../models/career').model,
  LevelModel = require('../../models/level').model,
  CamadaModel = require('../../models/admin/camada').model,
  CoworkinModel = require('../../models/coworking').model,
  CountryModel = require('../../models/country').model,
  AdminUserModel = require('../../models/admin/admin_user').model,
  timeZone = 'America/Argentina/Buenos_Aires';

let sendNotice = (params, cb) => {
  MailHelper.send({
    toEmail: isProd ? params.emails : 'it@coderhouse.com',
    country: params.country,
    subject: 'Coderhouse: ¡Tenemos un nuevo curso!',
    tpl: {
      path: params.tpl.path,
      params: params.tpl.params
    }
  }, cb);
};

let sendWelcomeStudent = (params, cb) => {
  MailHelper.send({
    toEmail: isProd ? params.email : 'it@coderhouse.com',
    fromEmail: 'chris@coderhouse.com',
    subject: '¡Bienvenid@ a Coderhouse!',
    bcc: isProd ? 'hola@coderhouse.com' : 'it@coderhouse.com',
    tpl: {
      path: './server/templates/subscriptions/welcome-student.html',
      params: params.tpl.params
    }
  }, cb);
};

module.exports = class Courses {

  static create(req, res, next) {
    Model.create(req.body, (err, course) => {
      helpers.handleResponse(res, err, course);
    });
  }

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
      .sort('startDate')
      .populate('career level')
      .populate({
        path: 'camada',
        model: 'Camada',
        populate: [{
          path: 'students',
          model: 'AdminUser',
          select: 'email profile.first_name profile.last_name profile.phone'
        }, {
          path: 'teachers',
          model: 'AdminUser',
          select: 'email profile.first_name profile.last_name profile.phone'
        }, {
          path: 'pendingStudents',
          model: 'AdminUser',
          select: 'email profile.first_name profile.last_name profile.phone'
        }, {
          path: 'freeStudents',
          model: 'AdminUser',
          select: 'email profile.first_name profile.last_name profile.phone'
        }]
      })
      .lean().exec((err, docs) => {
        helpers.handleResponse(res, err, docs);
      });
  }

  static readById(req, res, next) {
    Model.findById(req.params.courseId)
      .populate('career level')
      .populate({
        path: 'camada',
        model: 'Camada',
        populate: [{
          path: 'students',
          model: 'AdminUser',
          select: 'email profile.first_name profile.last_name profile.phone'
        }, {
          path: 'teachers',
          model: 'AdminUser',
          select: 'email profile.first_name profile.last_name profile.phone'
        }, {
          path: 'pendingStudents',
          model: 'AdminUser',
          select: 'email profile.first_name profile.last_name profile.phone'
        }, {
          path: 'freeStudents',
          model: 'AdminUser',
          select: 'email profile.first_name profile.last_name profile.phone'
        }]
      })
      .lean().exec((err, doc) => {
        helpers.handleResponse(res, err, doc);
      });
  }

  static update(req, res, next) {
    delete req.body._id;
    let camada = req.body.camada;

    let put = () => {
      Model.findByIdAndUpdate(req.params.courseId, req.body, {
        new: true
      }).lean().exec((err, doc) => {
        Courses.readById(req, res);
      });
    };

    let putCamada = () => {
      if (camada && !_.isString(camada)) {
        if (!camada._id) {
          CamadaModel.findOne()
            .sort('-id')
            .limit(1)
            .lean().exec((err, lastDoc) => {
              console.log(camada);
              CamadaModel.create(_.merge(camada, {
                id: parseInt(lastDoc.id, 10) + 5
              }), (err, doc) => {
                if (!err && doc) {
                  req.body.camada = doc._id;
                } else {
                  req.body.camada = req.body.camada._id;
                }
                put();
              });
            });
        } else {
          CamadaModel.findByIdAndUpdate(req.body.camada._id, camada, {
            new: true
          }).lean().exec((err, doc) => {
            if (!err && doc) {
              req.body.camada = doc._id;
            } else {
              req.body.camada = req.body.camada._id;
            }
            put();
          });
        }
      } else {
        put();
      }
    };

    let putStudents = () => {
      async.parallel([(parallelCb) => {
        let teachers = [];
        async.each(camada.teachers, (teacher, cb) => {
          if (!teacher._id) {
            teacher.role = 3;
            AdminUserModel.create(teacher, (err, doc) => {
              teachers.push(doc._id);
              cb();
            });
          } else {
            teachers.push(teacher._id);
            cb();
          }
        }, () => {
          camada.teachers = teachers;
          parallelCb(null);
        });
      }, (parallelCb) => {
        let students = [];
        async.each(camada.students, (student, cb) => {
          if (!student._id) {
            student.role = 2;
            AdminUserModel.create(student, (err, doc) => {
              students.push(doc._id);
              cb();
            });
          } else {
            students.push(student._id);
            cb();
          }
        }, () => {
          camada.students = students;
          parallelCb(null);
        });
      }, (parallelCb) => {
        let freeStudents = [];
        async.each(camada.freeStudents, (student, cb) => {
          if (!student._id) {
            student.role = 2;
            AdminUserModel.create(student, (err, doc) => {
              freeStudents.push(doc._id);
              cb();
            });
          } else {
            freeStudents.push(student._id);
            cb();
          }
        }, () => {
          camada.freeStudents = freeStudents;
          parallelCb(null);
        });
      }, (parallelCb) => {
        let pendingStudents = [];
        async.each(camada.pendingStudents, (student, cb) => {
          if (!student._id) {
            student.role = 2;
            AdminUserModel.create(student, (err, doc) => {
              pendingStudents.push(doc._id);
              cb();
            });
          } else {
            pendingStudents.push(student._id);
            cb();
          }
        }, () => {
          camada.pendingStudents = pendingStudents;
          parallelCb(null);
        });
      }], (err) => {
        putCamada();
      });
    };

    let getCamada = () => {
      if (camada && camada._id) {
        CamadaModel.findById(camada._id)
          .populate([{
            path: 'students',
            model: 'AdminUser'
          }])
          .lean().exec((err, doc) => {
            async.each(doc.students, (student, cb) => {
              let noStartedYet = new Date().getTime() <= new Date(req.body.startDate);
              if (noStartedYet && student && student.profile && student.profile.notifications && student.profile.notifications.welcome) {
                cb();
              } else if (noStartedYet) {
                AdminUserModel.findByIdAndUpdate(student._id, {
                  $set: {
                    'profile.notifications.welcome': true
                  }
                }, {
                  safe: true,
                  upsert: true,
                  new: true
                }).lean().exec((err, studentDoc) => {
                  if (!err && studentDoc) {
                    sendWelcomeStudent({
                      email: studentDoc.email,
                      tpl: {
                        params: {
                          studentName: studentDoc.profile && studentDoc.profile.first_name
                        }
                      }
                    }, cb);
                  } else {
                    cb();
                  }
                });
              } else {
                cb();
              }
            }, () => {
              putStudents();
            });
          });
      } else {
        putStudents();
      }
    };

    getCamada();
  }

  static delete(req, res, next) {
    Model.findByIdAndUpdate(req.params.courseId, {
      $set: {
        display: false
      }
    }, {
      new: true
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc, next);
    });
  }

  static sendNoticeCoworking(req, res, next) {
    let coworkings = req.body.coworkings;

    Model.findById(req.params.courseId)
      .populate({
        path: 'career',
        model: 'Career'
      })
      .populate({
        path: 'level',
        model: 'Level'
      })
      .lean().exec((err, course) => {
        console.log('sendNoticeCoworking');
        course.startDate = dateFormat(course.startDate, 'dd-mm-yyyy');
        course.endDate = dateFormat(course.endDate, 'dd-mm-yyyy');
        course.hours = (course.startHour && course.endHour) ? moment.tz(course.startHour, timeZone).format('HH:mm') + ' - ' + moment.tz(course.endHour, timeZone).format('HH:mm') : course.hours;

        let domains = helpers.domains();
        _.forEach(coworkings, (cowork) => {
          _.forEach(cowork.locations, (location) => {
            if (location.sendMail && (location.emails && location.emails.length)) {
              sendNotice({
                country: course.country,
                emails: location.emails,
                tpl: {
                  path: './server/templates/coworking/notice-new-course.html',
                  params: {
                    course: course,
                    formUrl: domains.api + 'courses/confirm-coworking/' + course._id + '/' + cowork.name + '/' + cowork.address,
                    cowork: {
                      name: cowork.name,
                      address: location.address.formatted_address
                    }
                  }
                }
              });
            }
          });
        });

        helpers.handleResponse(res, err, coworkings, next);
      });
  }

  static sendNoticeTeachers(req, res, next) {
    let teachers = req.body.teachers;

    Model.findById(req.params.courseId)
      .populate({
        path: 'career',
        model: 'Career'
      })
      .populate({
        path: 'level',
        model: 'Level'
      })
      .lean().exec((err, course) => {
        console.log('sendNoticeTeachers');
        course.startDate = dateFormat(course.startDate, 'dd-mm-yyyy');
        course.endDate = dateFormat(course.endDate, 'dd-mm-yyyy');
        course.hours = (course.startHour && course.endHour) ? moment.tz(course.startHour, timeZone).format('HH:mm') + ' - ' + moment.tz(course.endHour, timeZone).format('HH:mm') : course.hours;

        let code = course.country;

        switch (code) {
        case 'ar':
          course.country = 'Argentina';
          break;
        case 'cl':
          course.country = 'Chile';
          break;
        case 'uy':
          course.country = 'Uruguay';
          break;
        }

        let notify = (teacher) => {
          sendNotice({
            country: code,
            emails: teacher.email,
            tpl: {
              path: './server/templates/teachers/notice-new-course.html',
              params: {
                course: course
              }
            }
          });
        };

        if (teachers && teachers.length) {
          _.forEach(teachers, (teacher) => {
            if (teacher.sendMail) {
              notify(teacher);
            }
          });
        } else {
          AdminUserModel.find({
            enable: true,
            role: parseInt(3, 10)
          }).lean().exec((err, docs) => {
            _.forEach(docs, (doc) => {
              notify(doc);
            });
          });
        }

        helpers.handleResponse(res, err, teachers, next);
      });
  }
};
