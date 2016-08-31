'use strict';

const helpers = require('../../helpers'),
  Coworkings = require('../../controllers/coworkings');

module.exports = (app) => {

  app.route('/private/coworkings/available')
    .get(helpers.checkAuth, Coworkings.getAvailabe);

  app.route('/private/coworkings')
    .get(helpers.checkAuth, Coworkings.list)
    .post(helpers.checkAuth, Coworkings.create);

  app.route('/private/coworkings/:coworkingId')
    .get(helpers.checkAuth, Coworkings.read)
    .put(helpers.checkAuth, Coworkings.update)
    .delete(helpers.checkAuth, Coworkings.delete);
};
