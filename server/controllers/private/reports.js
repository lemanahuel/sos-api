'use strict';

const helpers = require('../../admin_helpers');
const async = require('async');
const _ = require('lodash');
const AdminUserModel = require('../../models/admin/admin_user').model;
const AdminScheduleModel = require('../../models/admin/admin_schedule').model;
const CamadaModel = require('../../models/admin/camada').model;
const CertificationModel = require('../../models/certification').model;

module.exports = class Reports {

  static ioUsers(req, res) {
    let where = {};

    if (req.query.role) {
      where.role = parseInt(req.query.role, 10);
    }

    AdminUserModel.find(where)
      .sort('email')
      .select('-histories -tps -password')
      .lean().exec((err, docs) => {
        async.each(docs, (doc, cb) => {
          let findParams = {};

          if (where.role === 2) {
            findParams.students = {
              $in: [doc._id]
            };
          } else if (where.role === 3) {
            findParams.teachers = {
              $in: [doc._id]
            };
          }

          CamadaModel.find(findParams)
            .populate('class')
            .select('-teachers -students')
            .lean().exec((err, camadas) => {
              doc.camadas = camadas;
              cb(null);
            });
        }, () => {
          helpers.handleResponse(res, err, docs);
        });
      });
  }
};
