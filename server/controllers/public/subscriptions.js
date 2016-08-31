'use strict';

const helpers = require('../helpers'),
  LeadHelper = require('../helpers/lead'),
  MailHelper = require('../helpers/mail'),
  CareerModel = require('../models/career').model,
  LevelModel = require('../models/level').model,
  Model = require('../models/subscription').model,
  RecruiterModel = require('../models/private/recruiter').model,
  ObjectId = require('mongoose').Types.ObjectId,
  _ = require('lodash'),
  async = require('async'),
  request = require('request'),
  geo = require('./countries'),
  coursesMapHelper = require('../helpers/courses-map'),
  isProd = helpers.isProd();

let send = function (doc) {
  doc.linkPlan = coursesMapHelper[doc.urlMap].program;
  let tplPath = './server/templates/subscriptions/course-details.html';
  let subject = 'El programa de ' + doc.titleCareer + ' ' + doc.titleLevel + ' solicitado.';

  if (doc.type === 'free-class') {
    subject = 'Tu primer clase en Coderhouse!';
    tplPath = './server/templates/subscriptions/free-class.html';
  }

  if (!doc.linkInscripcion) {
    console.log('sin linkInscripcion', doc);
    doc.linkInscripcion = 'https://www.coderhouse.com';
  }

  MailHelper.send({
    toEmail: isProd ? doc.email : 'it@coderhouse.com',
    country: doc.country || 'ar',
    subject: subject,
    tpl: {
      path: tplPath,
      params: doc
    }
  });
};

module.exports = class Subscriptions {

  static newsletter(req, res, next) {
    let body = req.body;

    Model.findOne({
      email: body.email,
      type: body.type
    }).lean().exec((err, subscriptionDoc) => {
      if (!err && !subscriptionDoc) {
        Model.create(body, (err, doc) => {
          if (!err) {
            LeadHelper.create(doc);
            MailHelper.send({
              toEmail: isProd ? doc.email : 'it@coderhouse.com',
              country: doc.country || 'ar',
              subject: 'Bienvenid@ a Coderhouse!',
              tpl: {
                path: './server/templates/subscriptions/welcome-newsletter.html',
                params: doc
              }
            });
          } else {
            console.log('newsletter', err);
          }
          helpers.handleResponse(res, err, doc, next);
        });
      } else {
        helpers.handleResponse(res, err, {
          error: 'already-subscribed'
        }, next);
      }
    });
  }

  static jobNewsletter(req, res, next) {
    let body = req.body;
    body.type = req.body.type || 'job-newsletter';

    Model.findOne({
      email: body.email,
      type: body.type
    }).lean().exec((err, subscriptionDoc) => {
      if (!err && !subscriptionDoc) {
        Model.create(req.body, (err, doc) => {
          if (err) {
            console.log('jobNewsletter', err);
          }
          LeadHelper.create(doc);
          if (res) {
            MailHelper.send({
              toEmail: isProd ? doc.email : 'it@coderhouse.com',
              country: doc.country || 'ar',
              subject: 'Bienvenid@ a Empleos de Coderhouse!',
              tpl: {
                path: './server/templates/subscriptions/welcome-job-newsletter.html',
                params: doc
              }
            });
            helpers.handleResponse(res, err, doc, next);
          }
        });
      } else if (res) {
        helpers.handleResponse(res, err, {
          error: 'already-subscribed'
        }, next);
      }
    });
  }

  static course(req, res, next) {
    let body = req.body;
    let findParams = {
      email: body.email,
      type: body.type
    };

    body.extra_data = {
      id_career: body.course ? body.course.id_career : '',
      id_level: body.course ? body.course.id_level : ''
    };

    if (body.course && body.course.id_career) {
      findParams.extra_data = findParams.extra_data || {};
      findParams.extra_data.id_career = body.course.id_career;
    }
    if (body.course && body.course.id_level) {
      findParams.extra_data = findParams.extra_data || {};
      findParams.extra_data.id_level = body.course.id_level;
    }

    Model.findOne(findParams)
      .lean().exec((err, subscriptionDoc) => {
        if (!err && !subscriptionDoc) {
          Model.create(body, (err, doc) => {
            if (!err) {
              let urlWeb = process.env.ENV_QA === true ? 'https://ch-www-qa.herokuapp.com' : 'https://www.coderhouse.com';
              CareerModel.findOne({
                id_career: body.course.id_career
              }).lean().exec((err, careerDoc) => {
                if (!err) {
                  var leadsParams = body;
                  doc = _.assign(doc, {
                    titleCareer: careerDoc.title,
                    urlMap: careerDoc.url,
                    linkInscripcion: urlWeb + '/carrera/' + careerDoc.url
                  });

                  if (parseInt(body.course.id_level, 10)) {
                    LevelModel.findOne({
                      id_career: body.course.id_career,
                      id_level: body.course.id_level
                    }).lean().exec((err, levelDoc) => {
                      if (!err) {
                        doc = _.assign(doc, {
                          titleLevel: levelDoc.title,
                          urlMap: levelDoc.url,
                          linkInscripcion: urlWeb + '/cursos/' + levelDoc.url
                        });
                        leadsParams.doc = doc;
                        LeadHelper.create(leadsParams);
                        send(doc);
                      } else {
                        console.log('course-LevelModel', err);
                      }
                    });
                  } else {
                    doc = _.assign(doc, {
                      titleLevel: 'Carrera'
                    });
                    leadsParams.doc = doc;
                    LeadHelper.create(leadsParams);
                    send(doc);
                  }
                } else {
                  console.log('course-CareerModel', err);
                }
              });
            } else {
              console.log('course', err);
            }
            helpers.handleResponse(res, err, doc, next);
          });
        } else {
          helpers.handleResponse(res, err, {
            error: 'already-subscribed'
          }, next);
        }
      });
  }

  static courseInstapage(req, res, next) {
    helpers.handleResponse(res, null, {}, next);
  }

  static business(req, res, next) {
    let body = req.body;
    Model.findOne(body)
      .lean().exec((err, subscriptionDoc) => {
        if (!err && !subscriptionDoc) {
          Model.create(body, (err, doc) => {
            if (!err) {
              MailHelper.send({
                toEmail: isProd ? doc.email : 'it@coderhouse.com',
                country: doc.country || 'ar',
                subject: 'Educación digital para empleados',
                tpl: {
                  path: './server/templates/subscriptions/welcome-business.html',
                  params: doc
                }
              });
              MailHelper.send({
                toEmail: isProd ? ['pablo@coderhouse.com', 'chris@coderhouse.com'] : 'it@coderhouse.com',
                country: doc.country || 'ar',
                subject: 'Pedido de Empresa',
                tpl: {
                  path: './server/templates/subscriptions/contact-business.html',
                  params: doc
                }
              });
            }

            helpers.handleResponse(res, err, doc, next);
          });
        } else {
          helpers.handleResponse(res, err, {
            error: 'already-subscribed'
          }, next);
        }
      });
  }

  static workshop(req, res, next) {
    var body = req.body;
    body.workshop = body.workshop || {};
    body.title = body.workshop && body.workshop.title ? body.workshop.title : 'Workshops';

    Model.findOne({
      email: body.email,
      type: 'workshop'
    }).lean().exec((err, subscriptionDoc) => {
      if (!err && !subscriptionDoc) {
        Model.create(body, (err, doc) => {
          if (!err) {
            LeadHelper.create(doc);
            MailHelper.send({
              toEmail: isProd ? doc.email : 'it@coderhouse.com',
              country: doc.country || 'ar',
              subject: '¡Gracias por tu interés en nuestros workshops!',
              tpl: {
                path: './server/templates/subscriptions/welcome-workshop.html',
                params: body
              }
            });
          }
          helpers.handleResponse(res, err, doc, next);
        });
      } else {
        helpers.handleResponse(res, err, {
          error: 'already-subscribed'
        }, next);
      }
    });
  }

  static automatic(req, res, next) {
    // Model.create(req.body, (err, doc) => {
    //   helpers.handleResponse(res, err, doc, next);
    // });
  }

  static test(req, res, next) {
    // Model.create(req.body, (err, doc) => {
    //   helpers.handleResponse(res, err, doc, next);
    // });
  }

  static read(req, res, next) {
    let options = {};
    let findParams = {
      email: {
        $exists: true
      }
    };
    let q = req.query;
    let select = '';
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

    if (q.type) {
      findParams.type = q.type;
    }

    if (q.limit) {
      options.limit = parseInt(q.limit, 10);
    }

    if (req.query.fields) {
      select += req.query.fields.split(',').join(' ');
    }

    Model.find(_.merge(displayable, findParams), null, options)
      .sort('-_id')
      .select(select)
      .lean().exec((err, docs) => {
        _.each(docs, (doc) => {
          doc.created = ObjectId(doc._id).getTimestamp();
        });
        helpers.handleResponse(res, err, docs, next);
      });
  }

  static delete(req, res, next) {
    Model.findByIdAndUpdate(req.params.subscriptionId, {
      $set: {
        display: false
      }
    }, {
      new: true
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc, next);
    });
  }

  static unsubscribe(req, res, next) {
    Model.findByIdAndUpdate(req.params.subscriptionId, {
      $set: {
        unsubscribe: true
      }
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, {
        success: true,
        msg: 'unsubscribe'
      }, next);
    });
  }

  static unsubscribeNextCoursesNewsletter(req, res, next) {
    Model.findByIdAndUpdate(req.params.subscriptionId, {
      $set: {
        'newsletter.nextCourses': false
      }
    }, {
      new: true
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, {
        success: true,
        msg: 'next-courses-unsubscribed'
      }, next);
    });
  }

  static unsubscribeJobsNewsletter(req, res, next) {
    Model.findByIdAndUpdate(req.params.subscriptionId, {
      $set: {
        'newsletter.jobs': false
      }
    }, {
      new: true
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, {
        success: true,
        msg: 'jobs-unsubscribed'
      }, next);
    });
  }

  static unsubscribeRecruitersNewsletter(req, res, next) {
    RecruiterModel.findByIdAndUpdate(req.params.subscriptionId, {
      $set: {
        'newsletter.jobs': false
      }
    }, {
      new: true
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, {
        success: true,
        msg: 'unsubscribed'
      }, next);
    });
  }

};
