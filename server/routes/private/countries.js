'use strict';

const helpers = require('../../helpers'),
  Countries = require('../../controllers/countries');

module.exports = (app) => {

  app.route('/private/countries')
    .get(helpers.checkAuth, Countries.list)
    .post(helpers.checkAuth, Countries.create);

  app.route('/private/countries/:countryId')
    .get(helpers.checkAuth, Countries.read)
    .put(helpers.checkAuth, Countries.update)
    .delete(helpers.checkAuth, Countries.delete);

};
