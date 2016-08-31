'use strict';

const helpers = require('../../helpers'),
  Careers = require('../../controllers/careers');

module.exports = (app) => {

  app.route('/private/careers')
    .get(helpers.checkAuth, Careers.read)
    .post(helpers.checkAuth, Careers.create);

  app.route('/private/careers/:careerId')
    .get(helpers.checkAuth, Careers.readById)
    .put(helpers.checkAuth, Careers.update)
    .delete(helpers.checkAuth, Careers.delete);

};