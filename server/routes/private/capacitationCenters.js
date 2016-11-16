'use strict';

const helpers = require('../../helpers'),
  CC = require('../../controllers/private/capacitationCenters');

module.exports = (app) => {

  app.route('/private/capacitation-centers')
    .get(helpers.checkAuth, CC.list)
    .post(helpers.checkAuth, CC.create);

  app.route('/private/capacitation-centers/:ccId')
    .get(helpers.checkAuth, CC.read)
    .put(helpers.checkAuth, CC.update)
    .delete(helpers.checkAuth, CC.delete);

};