'use strict';

const Auth = require('../../controllers/auth');

module.exports = (app) => {

  app.route('/authenticate').post(Auth.authenticate);
  app.route('/logout').post(Auth.logout);
  app.route('/getToken').get(Auth.getToken);
};