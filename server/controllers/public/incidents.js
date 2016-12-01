'use strict';

const helpers = require('../../helpers'),
  request = require('request'),
  async = require('async'),
  geocoder = require('geocoder'),
  _ = require('lodash');
const FCM = require('fcm-push');
const fcm = new FCM('AIzaSyDi7v71mSCz5sVjXew3bYUrCbfhsadVcL4');
const Model = require('../../models/private/incident').model;
const UserModel = require('../../models/private/user').model;

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

let sendNotification = (incident) => {
  console.log('UserModel Comuna', helpers.normalizeComuna(incident.comuna));

  UserModel.find({
    comuna: helpers.normalizeComuna(incident.comuna),
    isVolunteer: true
  }).lean().exec((err, docs) => {
    console.log('UserModel', docs.length);

    async.each(docs, (doc, cb) => {
      console.log(doc.email, incident.token);
      if (doc && doc.token !== incident.token) {
        fcm.send({
          to: doc.token,
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
      } else {
        console.log("Owner error", err);
        cb(null);
      }
    }, (err) => {
      console.log('FINISH-incidents', docs.length);
    });
  });
};

let sendNotifications = () => {
  let d = new Date();
  d.setMinutes(d.getMinutes() - 5);

  Model.find({
    enable: true,
    createdAt: {
      $gte: d
    }
  }).lean().exec((err, docs) => {
    console.log('incidents', docs.length);

    async.each(docs, (incident, cb) => {
      console.log(incident.title, incident.body);
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

    // {
    //   address_components: [{ long_name: '1894', short_name: '1894', types: [Object] },
    //     { long_name: 'Lavalle', short_name: 'Lavalle', types: [Object] },
    //     {
    //       long_name: 'Balvanera',
    //       short_name: 'Balvanera',
    //       types: [Object]
    //     },
    //     {
    //       long_name: 'Buenos Aires',
    //       short_name: 'CABA',
    //       types: [Object]
    //     },
    //     {
    //       long_name: 'Comuna 3',
    //       short_name: 'Comuna 3',
    //       types: [Object]
    //     },
    //     {
    //       long_name: 'Ciudad Autónoma de Buenos Aires',
    //       short_name: 'CABA',
    //       types: [Object]
    //     },
    //     { long_name: 'Argentina', short_name: 'AR', types: [Object] },
    //     {
    //       long_name: 'C1051ABB',
    //       short_name: 'C1051ABB',
    //       types: [Object]
    //     }
    //   ],
    //   formatted_address: 'Lavalle 1894, C1051ABB CABA, Argentina',
    //   geometry: {
    //     location: { lat: -34.603283, lng: -58.39368700000001 },
    //     location_type: 'ROOFTOP',
    //     viewport: { northeast: [Object], southwest: [Object] }
    //   },
    //   place_id: 'ChIJi1VfMsDKvJURuT9CNfiZOrQ',
    //   types: ['street_address']
    // }

    geocoder.reverseGeocode(incident.location.lte, incident.location.lng, (err, geoRes) => {
      console.log('geocoder', err, geoRes && geoRes.results[0]);
      let geo = geoRes && geoRes.results[0];
      let comuna = '';

      if (geo && geo.address_components) {
        comuna = _.find(geo.address_components, (item) => {
          console.log(item.long_name, item.types);
          return item.types.indexOf('administrative_area_level_2') !== -1;
        });
        if (comuna && comuna.short_name) {
          comuna = comuna.short_name;
        }
      }


      console.log('incident', {
        token: incident.token,
        comuna: helpers.normalizeComuna(comuna),
        title: 'Nueva Emergencia',
        body: geo.formatted_address
      });

      if (!err) {
        Model.create({
          user: incident.user,
          location: geo,
          token: incident.token,
          comuna: helpers.normalizeComuna(comuna),
          title: 'Nueva Emergencia',
          body: geo.formatted_address
        }, (err, doc) => {
          //sendNotifications();
          sendNotification(doc);

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
      createdAt: {
        $gte: d
      }
    }).sort('createdAt').lean().exec((err, docs) => {
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
    console.log(response);

    Model.findById(req.params.incidentId).lean().exec((err, doc) => {
      if (!err && doc) {
        let amountOfAffirmatives = _.filter(doc.responses, {
          affirmative: true
        });
        if (amountOfAffirmatives.length >= 3) {
          params.enable = false;
        }
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

  static getComuna() {
    let incident = req.body;

    geocoder.reverseGeocode(incident.latitude, incident.longitude, (err, geoRes) => {
      let geo = geoRes && geoRes.results[0];
      let comuna = '';

      if (geo && geo.address_components) {
        comuna = _.find(geo.address_components, (item) => {
          return item.types.indexOf('administrative_area_level_2') !== -1;
        });
        if (comuna && comuna.short_name) {
          comuna = comuna.short_name;
        }
      }

      if (!err) {
        helpers.handleResponse(res, err, {
          comuna: helpers.normalizeComuna(comuna)
        }, next);
      } else {
        helpers.handleResponse(res, err, {
          msg: 'cant-get-comuna'
        }, next);
      }
    });
  }
};