const helpers = require('../../helpers'),
  async = require('async'),
  _ = require('lodash');
const FCM = require('fcm-push');
const fcm = new FCM('AIzaSyB6GGfmBH5AB9lkXnUD96cpci6JpwnKLb0');
let users = [];

module.exports = class Messages {

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
        notification: {
          title: 'User: ' + user.name,
          body: 'Body: ' + user.txt + ' - Notificacion enviada a ' + users.length + ' VoluntarioSOS'
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
    });
  }

  static read(req, res, next) {
    helpers.handleResponse(res, null, {
      msg: 'test'
    });
  }

};