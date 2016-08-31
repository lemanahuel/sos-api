'use strict';

const helpers = require('../../helpers'),
  Workshops = require('../../controllers/workshops');

module.exports = (app) => {

  app.route('/private/workshops')
    .get(helpers.checkAuth, Workshops.read)
    .post(helpers.checkAuth, Workshops.create);

  app.route('/private/workshops/:workshopId')
    .get(helpers.checkAuth, Workshops.readById)
    .put(helpers.checkAuth, Workshops.update)
    .delete(helpers.checkAuth, Workshops.delete);

};