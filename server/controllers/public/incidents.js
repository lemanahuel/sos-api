const helpers = require('../../helpers'),
  async = require('async'),
  _ = require('lodash');
const FCM = require('fcm-push');
const fcm = new FCM('AIzaSyDi7v71mSCz5sVjXew3bYUrCbfhsadVcL4');
const Model = require('../../models/private/incidents').model;
let users = [];

module.exports = class Incidents {

  static send(req, res, next) {
    users.push(req.body);

    //collapse_key: 'your_collapse_key',
    // data: {
    //   your_custom_data_key: 'your_custom_data_value'
    // },

    // users = _.groupBy(users, 'token');

    console.log(users);

    async.each(users, (user, cb) => {
      fcm.send({
        to: user.token,
        data: {
          title: user.txt,
          body: user.name,
          user: user
        },
        notification: {
          title: user.txt + ' (' + users.length + ')',
          body: user.name
        }
      }).then((res) => {
        console.log("Successfully sent with response: ", res);
        cb(null);
      }).catch((err) => {
        console.log("Something has gone wrong!", err);
        cb(null);
      });
    }, (err) => {
      console.log('FINISH-USERS', users.length);
      helpers.handleResponse(res, null, req.body);
    });
  }

  static list(req, res, next) {
    Model.find().lean().exec((err, docs) => {
      helpers.handleResponse(res, err, docs);
    });
  }

  static read(req, res, next) {
    helpers.handleResponse(res, null, users);
  }

};