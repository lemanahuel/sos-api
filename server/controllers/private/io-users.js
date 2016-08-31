'use strict';

const helpers = require('../../admin_helpers');
const async = require('async');
const _ = require('lodash');
const Model = require('../../models/admin/admin_user').model;
const CertificationModel = require('../../models/certification').model;
const TpModel = require('../../models/admin/tp').model;

module.exports = class Users {

  static create(req, res) {
    if (req.body.role) {
      req.body.role = parseInt(req.body.role, 10);
    }
    Model.create(req.body, (err, doc) => {
      helpers.handleResponse(res, err, doc);
    });
  }

  static list(req, res) {
    let where = {};
    let select = '-histories -tps -password ';

    if (req.query.role) {
      where.role = parseInt(req.query.role, 10);
    }

    if (req.query.country) {
      where.profile.country = req.query.country;
    }

    if (req.query.enable) {
      where.enable = req.query.enable;
    }

    if (req.query.fields) {
      select += req.query.fields.split(',').join(' ');
    }

    Model.find(where)
      .select(select)
      .select('-histories -tps -password')
      .sort('_id')
      .lean().exec((err, docs) => {
        helpers.handleResponse(res, err, docs);
      });
  }

  static read(req, res) {
    let where = {};

    Model.findById(req.params.userId)
      .lean().exec((err, doc) => {
        if (req.query.moduleId) {
          TpModel.findOne({
            user: doc._id,
            module: req.query.moduleId
          }).lean().exec((err, tp) => {
            doc.tp = tp;
            helpers.handleResponse(res, err, doc);
          });
        } else {
          CertificationModel.find({
            user: doc._id
          }).populate('class').lean().exec((err, certs) => {
            doc.profile = doc.profile || {};
            doc.profile.certifications = certs;
            helpers.handleResponse(res, err, doc);
          });
        }
      });
  }

  static update(req, res) {
    if (req.body.role) {
      req.body.role = parseInt(req.body.role, 10);
    }

    Model.findByIdAndUpdate(req.params.userId, req.body, {
      new: true
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc);
    });
  }

  static delete(req, res) {
    Model.findByIdAndUpdate(req.params.userId, {
      $set: {
        enable: false
      }
    }, {
      new: true
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc);
    });
  }

  static getAvailabe(req, res, next) {
    let q = req.query;
    let where = {
      enable: true,
      role: parseInt(3, 10)
    };
    let teachersTmp = [];
    let teachers = [];

    Model.find(where)
      .sort('_id')
      .select('-histories -tps -email_Verified -password -enable')
      .lean().exec((err, docs) => {

        if (q.career && q.level) {
          _.each(docs, (item) => {
            if (item.profile && item.profile.courses && item.profile.courses[q.career] && item.profile.courses[q.career].indexOf(q.level) !== -1) {
              teachersTmp.push(item);
            }
          });
        } else {
          teachersTmp = docs;
        }

        if (q.country) {
          let country;
          switch (q.country) {
          case 'ar':
            country = 'Argentina';
            break;
          case 'uy':
            country = 'Uruguay';
            break;
          case 'cl':
            country = 'Chile';
            break;
          }

          _.each(teachersTmp, (item) => {
            if (item.profile && item.profile.country && item.profile.country === country) {
              teachers.push(item);
            } else if (item.profile && item.profile.city) {
              _.each(item.profile.city.address_components, (comp, index) => {
                if (comp.types.indexOf('country') !== -1 && comp.long_name === country) {
                  teachers.push(item);
                }
              });
            }
          });
        } else {
          teachers = teachersTmp;
        }

        console.log(teachers.length);
        helpers.handleResponse(res, err, teachers);
      });
  }
};
