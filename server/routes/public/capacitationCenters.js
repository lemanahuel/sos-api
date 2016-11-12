'use strict';

const CC = require('../../controllers/public/capacitationCenters');

module.exports = (app) => {

  app.route('/capacitation-centers').get(CC.list);
  app.route('/capacitation-centers/:ccSlug').get(CC.readBySlug);

};
