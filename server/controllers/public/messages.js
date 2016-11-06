const helpers = require('../../helpers'),
  _ = require('lodash');
const FCM = require('fcm-push');
const fcm = new FCM('AIzaSyBAeWOBBPENZNH4DoSR_HgjOjLd51LcWB0');

module.exports = class Users {

  static send(req, res, next) {
    console.log("Successfully sent with response: ", req.body);
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
    }).then((res) => {
      console.log("Successfully sent with response: ", res);
    }).catch((err) => {
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