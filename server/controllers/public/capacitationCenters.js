const helpers = require('../../helpers'),
  Model = require('../../models/private/capacitationCenter').model,
  _ = require('lodash');

module.exports = class CC {

  static list(req, res, next) {
    Model.find().lean().exec((err, docs) => {
      docs = [{
        user: {},
        name: 'Centro de capacitacion',
        description: 'Damos capacitaciones',
        url: 'https://www.coderhouse.com',
        avatar: 'avatar.jpg',
        contact: {
          email: 'center@gmail.com',
          phone: 44810302
        },
        location: {
          address: {},
          hours: {
            from: new Date(),
            to: new Date()
          },
          days: {
            from: 1,
            to: 2
          }
        },
        courses: [{
          name: 'Curso de RPC',
          description: 'Descripcion del curso',
          url: 'https://www.coderhouse.com',
          published: false
        }],
        enable: false,
        published: false
      }];
      helpers.handleResponse(res, err, docs);
    });
  }

  static read(req, res, next) {
    Model.findById(req.params.ccId).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc);
    });
  }

  static readBySlug(req, res, next) {
    Model.findOne({
      url: req.params.ccSlug
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc);
    });
  }

  static update(req, res, next) {
    delete req.body._id;

    Model.findByIdAndUpdate(req.params.ccId, req.body, {
      new: true
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc, next);
    });
  }
};