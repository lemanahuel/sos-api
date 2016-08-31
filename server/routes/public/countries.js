'use strict';

const Countries = require('../../controllers/countries');

module.exports = (app) => {

  app.route('/country/geo').get(Countries.geo);
};
