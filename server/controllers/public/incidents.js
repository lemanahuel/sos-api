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
  Model.find({
    enable: true
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
      lng: incident.longitude,
    };

    geocoder.reverseGeocode(incident.location.lte, incident.location.lng, (err, res) => {
      console.log(res && res.data);
    });

    request.get('https://ws.usig.buenosaires.gob.ar/datos_utiles?lat=' + incident.location.lte + '&lon=' + incident.location.lng, (err, res, body) => {
      incident.location.comuna = res && res.data ? res.data.comuna : '';
      console.log(res && res.data);
    });

    Model.create({
      location: incident.location,
      token: incident.token,
    }, (err, doc) => {
      sendNotifications();

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