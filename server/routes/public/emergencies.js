'use strict';

const Incidents = require('../../controllers/public/incidents');

module.exports = (app) => {

  app.route('/emergencies')
    .post(Incidents.send)
    .get(Incidents.list);

  app.route('/emergencies/:emergencyId')
    .get(Incidents.read);

};