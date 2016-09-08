'use strict';

const helpers = require('../../helpers'),
  Users = require('../../controllers/private/users');

module.exports = (app) => {

  app.route('/private/users')
    .get(helpers.checkAuth, Users.read)
    .post(helpers.checkAuth, Users.create);

  app.route('/private/users/:userId')
    .get(helpers.checkAuth, Users.readById)
    .put(helpers.checkAuth, Users.update)
    .delete(helpers.checkAuth, Users.delete);

};
