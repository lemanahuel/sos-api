'use strict';

const helpers = require('../../helpers'),
  Company = require('../../controllers/companies');

module.exports = (app) => {

  app.route('/private/companies')
    .get(helpers.checkAuth, Company.read)
    .post(helpers.checkAuth, Company.create);

  app.route('/private/companies/:companyId')
    .get(helpers.checkAuth, Company.readById)
    .put(helpers.checkAuth, Company.update)
    .delete(helpers.checkAuth, Company.delete);

};