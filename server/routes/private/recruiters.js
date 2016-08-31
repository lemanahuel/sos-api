'use strict';

const helpers = require('../../helpers'),
  Recruiters = require('../../controllers/private/recruiters');

module.exports = (app) => {

  app.route('/private/recruiters')
    .get(helpers.checkAuth, Recruiters.list)
    .post(helpers.checkAuth, Recruiters.create);

  app.route('/private/recruiters/:recruiterId')
    .get(helpers.checkAuth, Recruiters.read)
    .put(helpers.checkAuth, Recruiters.update)
    .delete(helpers.checkAuth, Recruiters.delete);

};
