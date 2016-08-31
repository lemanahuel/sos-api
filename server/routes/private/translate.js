'use strict';

const helpers = require('../../helpers'),
  Translates = require('../../controllers/translates');

module.exports = (app) => {

  app.route('/private/translates')
    .get(helpers.checkAuth, Translates.read)
    .post(helpers.checkAuth, Translates.create);

  app.route('/private/translates/:translateId')
    .get(helpers.checkAuth, Translates.readById)
    .put(helpers.checkAuth, Translates.update)
    .delete(helpers.checkAuth, Translates.delete);

};