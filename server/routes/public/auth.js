'use strict';

const Auth = require('../../controllers/public/auth');

module.exports = (app) => {

  app.route('/auth/signin').post(Auth.signin);
  app.route('/auth/login').post(Auth.login);

};
