'use strict';

const helpers = require('../../helpers'),
  Reports = require('../../controllers/private/reports');

module.exports = (app) => {

  app.route('/private/reports/io-users')
    .get(helpers.checkAuth, Reports.ioUsers);

};
