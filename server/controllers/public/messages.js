const helpers = require('../../helpers'),
  _ = require('lodash');
const FCM = require('fcm-push');
const fcm = new FCM('AIzaSyB6GGfmBH5AB9lkXnUD96cpci6JpwnKLb0');

module.exports = class Users {

  static send(req, res, next) {
    console.log(req.body);
    fcm.send({
      to: req.body.toekn,
      //collapse_key: 'your_collapse_key',
      data: {
        your_custom_data_key: 'your_custom_data_value'
      },
      notification: {
        title: 'Nueva Emergencia',
        body: 'Hola ' + req.body.username
      }
    }).then((err, res) => {
      console.log("Successfully sent with response: ", err, res);
    }).catch((err, res) => {
      console.log("Something has gone wrong!");
      console.error(err);
    });
  }

  static read(req, res, next) {
    helpers.handleResponse(res, null, {
      msg: 'test'
    });
  }

};