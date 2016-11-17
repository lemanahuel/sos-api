'use strict';

const helpers = require('../../helpers'),
  async = require('async'),
  _ = require('lodash');
const FCM = require('fcm-push');
const fcm = new FCM('AIzaSyDi7v71mSCz5sVjXew3bYUrCbfhsadVcL4');
const Model = require('../../models/private/incident').model;

let sendNotification = () => {
  Model.find({
    enable: true
  }).lean().exec((err, docs) => {
    console.log('incidents', docs.length);

    async.each(docs, (incident, cb) => {
      fcm.send({
        to: incident.token,
        data: {
          title: incident.title,
          body: incident.body
        },
        notification: {
          title: incident.body,
          body: incident.name
        }
      }).then((res) => {
        console.log("Successfully sent with response: ", res);
        cb(null);
      }).catch((err) => {
        console.log("Something has gone wrong!", err);
        cb(null);
      });
    }, (err) => {
      console.log('FINISH-incidents', docs.length);
    });
  });
};

module.exports = class Incidents {

  static send(req, res, next) {
    let incident = req.body;

    //collapse_key: 'your_collapse_key',
    // data: {
    //   your_custom_data_key: 'your_custom_data_value'
    // },

    Model.create({
      location: incident.location,
      token: incident.token,
      title: incident.title,
      body: incident.body
    }, (err, doc) => {
      helpers.handleResponse(res, err, {
        msg: 'incident-sent'
      }, next);
    });
  }

  static list(req, res, next) {
    Model.find({
      enable: true
    }).lean().exec((err, docs) => {
      helpers.handleResponse(res, err, docs);
    });
  }

  static read(req, res, next) {
    Model.findById(req.params.incidentId).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc);
    });
  }

  static respond(req, res, next) {
    let response = req.body;

    Model.findById(req.params.incidentId).lean().exec((err, doc) => {
      let amountOfAffirmatives = _.filter(doc.responses, {
        affirmative: true
      });
      Model.findByIdAndUpdate(req.params.incidentId, {
        $push: {
          responses: response
        }
      }, {
        new: true
      }).lean().exec((err, doc) => {
        if (amountOfAffirmatives.length >= 3) {
          helpers.handleResponse(res, err, {
            msg: 'Ya respondieron afirmativamente varios voluntarios!'
          }, next);
        } else {
          helpers.handleResponse(res, err, doc, next);
        }
      });
    });
  }

};