'use strict';

const helpers = require('../../admin_helpers');
const async = require('async');
const _ = require('lodash');
const Model = require('../../models/admin/camada').model;
const AdminUserModel = require('../../models/admin/admin_user').model;
const ClassModel = require('../../models/admin/class').model;
const StageModel = require('../../models/admin/stage').model;
const ModuleModel = require('../../models/admin/module').model;
const ScheduleModel = require('../../models/admin/admin_schedule').model;
const CourseModel = require('../../models/course').model;
const CoworkingModel = require('../../models/coworking').model;
const Certifications = require('./certifications');

module.exports = class Camadas {

  static create(req, res) {
    Model.findOne()
      .sort('-id')
      .limit(1)
      .lean().exec((err, lastDoc) => {
        req.body.id = parseInt(lastDoc.id, 10) + 2;
        Model.create(req.body, (err, doc) => {
          helpers.handleResponse(res, err, doc);
        });
      });
  }

  static list(req, res) {
    let where = {
      enable: true
    };

    if (req.query.classId) {
      where.class = req.query.classId;
    }

    if (req.query.countryId) {
      where.country = req.query.countryId;
    }

    if (req.query.cityId) {
      where.city = req.query.cityId;
    }

    if (req.query.coworkingId) {
      where.coworking = req.query.coworkingId;
    }

    if (req.query.locationId) {
      where.location = req.query.locationId;
    }

    if (req.query.type) {
      where.type = req.query.type;
    }

    if (req.query.completed) {
      where.completed = req.query.completed;
    }

    if (req.query.studentId) {
      where.students = {
        $in: [req.query.studentId]
      };
    }

    if (req.query.teacherId) {
      where.teachers = {
        $in: [req.query.teacherId]
      };
    }

    Model.find(where)
      .sort('-id')
      .populate('class')
      .populate([{
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
      }])
      .lean().exec((err, docs) => {
        helpers.handleResponse(res, err, docs);
      });
  }

  static read(req, res) {
    Model.findById(req.params.camadaId)
      .populate('class students teachers pendingStudents freeStudents coworking')
      .lean().exec((err, doc) => {
        CourseModel.find({
            camada: doc._id
          })
          .populate('coworking')
          .lean().exec((err, docCourse) => {
            doc.course = docCourse;

            StageModel.find({
              class: doc.class._id
            }).sort('order').lean().exec((err, stages) => {
              if (err) {
                console.log(err);
              }
              doc.class.stages = stages;
              helpers.handleResponse(res, err, doc);
            });
          });
      });
  }

  static update(req, res) {
    let update = () => {
      let put = () => {
        Model.findByIdAndUpdate(req.params.camadaId, req.body, {
          new: true
        }).lean().exec((err, doc) => {
          Camadas.read(req, res);
        });
      };

      if (req.body.completed) {
        Model.findById(req.params.camadaId).lean().exec((err, doc) => {
          if (!doc.completed) {
            Certifications.createByCamada(req.params.camadaId);
            put();
          }
        });
      } else {
        put();
      }
    };

    if (req.body.students || req.body.teachers) {
      let students = [];
      let teachers = [];

      async.each(req.body.teachers, (teacher, cb) => {
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
        req.body.teachers = teachers;

        async.each(req.body.students, (student, cb) => {
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
          req.body.students = students;
          update();
        });
      });
    } else {
      update();
    }
  }

  static delete(req, res) {
    Model.findByIdAndUpdate(req.params.camadaId, {
      $set: {
        enable: false
      }
    }, {
      new: true
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc);
    });
  }
};
