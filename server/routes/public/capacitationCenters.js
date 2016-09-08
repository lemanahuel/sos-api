'use strict';

const CC = require('../../controllers/public/capacitationCenters');

module.exports = (app) => {

  app.route('/capacitation-centers').get(CC.read);
  app.route('/capacitation-centers/:ccSlug').get(CC.readBySlug);

};
