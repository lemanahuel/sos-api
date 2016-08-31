'use strict';

const helpers = require('../../helpers'),
  Ping = require('../../controllers/translates');

module.exports = (app) => {

  app.route('/private/translates')
    .get(helpers.checkAuth, helpers.isAuthenticatedRes);

};