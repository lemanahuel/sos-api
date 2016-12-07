'use strict';

const helpers = require('../../helpers'),
  Testimonies = require('../../controllers/private/testimonies');

module.exports = (app) => {

  app.route('/private/testimonies')
    .get(helpers.checkAuth, Testimonies.list)
    .post(helpers.checkAuth, Testimonies.create);

  app.route('/private/testimonies/:testimonyId')
    .get(helpers.checkAuth, Testimonies.read)
    .put(helpers.checkAuth, Testimonies.update)
    .delete(helpers.checkAuth, Testimonies.delete);

};