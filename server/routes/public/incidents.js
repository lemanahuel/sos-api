'use strict';

const Incidents = require('../../controllers/public/incidents');

module.exports = (app) => {

  app.route('/incidents')
    .post(Incidents.send)
    .get(Incidents.list);

  app.route('/incidents/:incidentId')
    .get(Incidents.read);

  app.route('/incidents/:incidentId/respond')
    .post(Incidents.respond);

  app.route('/comuna-by-coords')
    .get(Incidents.getComuna);

  app.route('/send/last-incident')
    .get(Incidents._sendNotification);

};