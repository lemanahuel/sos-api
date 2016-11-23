'use strict';

const helpers = require('../../helpers'),
  request = require('request'),
  async = require('async'),
  geocoder = require('geocoder'),
  _ = require('lodash');
const FCM = require('fcm-push');
const fcm = new FCM('AIzaSyDi7v71mSCz5sVjXew3bYUrCbfhsadVcL4');
const Model = require('../../models/private/incident').model;

let respondIncidentByNotification = (incident) => {
  fcm.send({
    to: incident.token,
    data: {
      location: incident.location
    },
    notification: {
      title: 'Voluntario confirmado',
      body: 'En breve un voluntario se estara acercado a tu ubicacion'
    }
  }).then((res) => {
    console.log("Successfully sent with response: ", res);
  }).catch((err) => {
    console.log("Something has gone wrong!", err);
  });
};

let sendNotifications = () => {
  let d = new Date();
  d.setMinutes(d.getMinutes() - 5);

  Model.find({
    enable: true,
    created_at: {
      $gte: d
    }
  }).lean().exec((err, docs) => {
    console.log('incidents', docs.length);

    async.each(docs, (incident, cb) => {
      fcm.send({
        to: incident.token,
        data: {
          location: incident.location
        },
        notification: {
          title: incident.title,
          body: incident.body
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
    console.log(incident);

    incident.location = {
      lte: incident.latitude,
      lng: incident.longitude
    };

    console.log(incident, incident.location, incident.location.lte, incident.location.lng);

    geocoder.reverseGeocode(incident.location.lte, incident.location.lng, (err, geoRes) => {
      console.log('geocoder', err, geoRes[0]);

      if (!err) {
        Model.create({
          location: geoRes[0],
          token: incident.token
        }, (err, doc) => {
          sendNotifications();

          helpers.handleResponse(res, err, {
            msg: 'incident-sent'
          }, next);
        });
      } else {
        helpers.handleResponse(res, err, {
          msg: 'incident-error'
        }, next);
      }
    });
  }

  static list(req, res, next) {
    let d = new Date();
    d.setMinutes(d.getMinutes() - 5);

    Model.find({
      enable: true,
      created_at: {
        $gte: d
      }
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
    let params = {
      $push: {
        responses: response
      }
    };

    Model.findById(req.params.incidentId).lean().exec((err, doc) => {
      let amountOfAffirmatives = _.filter(doc.responses, {
        affirmative: true
      });
      if (amountOfAffirmatives.length >= 3) {
        params.enable = false;
      }
      Model.findByIdAndUpdate(req.params.incidentId, params, {
        new: true
      }).lean().exec((err, doc) => {
        if (!doc.enable) {
          helpers.handleResponse(res, err, {
            msg: 'Ya respondieron afirmativamente varios voluntarios!'
          }, next);
        } else {
          respondIncidentByNotification(doc);
          helpers.handleResponse(res, err, doc, next);
        }
      });
    });
  }

};