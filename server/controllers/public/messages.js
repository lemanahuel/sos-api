'use strict';

const helpers = require('../../helpers'),
  _ = require('lodash');
const FCM = require('fcm-push');
const fcm = new FCM('AIzaSyBAeWOBBPENZNH4DoSR_HgjOjLd51LcWB0');

module.exports = class Users {

  static send(req, res, next) {
    fcm.send({
      to: 'chue6pvJ8uI:APA91bFhoaFqP449a8ip1O9GkWQSSS8AwYlUNaUin8I3nXV02ilX0zQDxMcmmpNGJdU6s9-8AZ9fb1S-s54bVwJHYjX7Qct5Wm-dQhBYaehDYRnMUL4UBtadHBkfX2o6vqy2MtCkzgJQ',
      //collapse_key: 'your_collapse_key',
      data: {
        your_custom_data_key: 'your_custom_data_value'
      },
      notification: {
        title: 'Nueva Emergencia',
        body: 'Body of your push notification'
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