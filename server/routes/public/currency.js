'use strict';

const Currency = require('../../controllers/currency');

module.exports = (app) => {

  app.route('/currency').get(Currency.read);

};
