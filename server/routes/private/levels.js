'use strict';

const helpers = require('../../helpers'),
  Levels = require('../../controllers/levels');

module.exports = (app) => {

  app.route('/private/levels')
    .get(helpers.checkAuth, Levels.read)
    .post(helpers.checkAuth, Levels.create);

  app.route('/private/levels/:levelId')
    .get(helpers.checkAuth, Levels.readById)
    .put(helpers.checkAuth, Levels.update)
    .delete(helpers.checkAuth, Levels.delete);

};