'use strict';

const Company = require('../../controllers/companies');

module.exports = (app) => {

  app.route('/companies').get(Company.read);

};