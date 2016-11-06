const helpers = require('../../helpers'),
  _ = require('lodash');
const FCM = require('fcm-push');
const fcm = new FCM('AIzaSyB6GGfmBH5AB9lkXnUD96cpci6JpwnKLb0');

module.exports = class Messages {

  static send(req, res, next) {
    console.log(req.body);
    console.log('token', req.body.token);
    console.log('token', req.body.token.toString());

    //collapse_key: 'your_collapse_key',
    // data: {
    //   your_custom_data_key: 'your_custom_data_value'
    // },

    fcm.send({
      to: req.body.token.toString(),
      notification: {
        title: 'Nueva Emergencia',
        body: 'Hola ' + req.body.username
      }
    }).then((res) => {
      console.log("Successfully sent with response: ", res);
    }).catch((err) => {
      console.log("Something has gone wrong!", err);
    });
  }

  static read(req, res, next) {
    helpers.handleResponse(res, null, {
      msg: 'test'
    });
  }

};