'use strict';

const Emergencies = require('../../controllers/public/emergencies');

module.exports = (app) => {

  app.route('/emergencies')
    .post(Emergencies.send)
    .get(Emergencies.read);

  app.route('/emergencies/:emergencyId')
    .get(Emergencies.readById);

};