'use strict';

const helpers = require('../../helpers'),
  Incidents = require('../../controllers/private/incidents');

module.exports = (app) => {

  app.route('/private/incidents')
    .get(helpers.checkAuth, Incidents.list)
    .post(helpers.checkAuth, Incidents.create);

  app.route('/private/incidents/:incidentId')
    .get(helpers.checkAuth, Incidents.read)
    .put(helpers.checkAuth, Incidents.update)
    .delete(helpers.checkAuth, Incidents.delete);

  app.route('/private/incidents/:incidentId/respond')
    .put(helpers.checkAuth, Incidents.respond);

};