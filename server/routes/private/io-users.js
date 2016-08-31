'use strict';

const helpers = require('../../helpers'),
  IOUsers = require('../../controllers/private/io-users');

module.exports = (app) => {

  app.route('/private/io-users')
    .get(helpers.checkAuth, IOUsers.list)
    .post(helpers.checkAuth, IOUsers.create);

  app.route('/private/io-users/:userId')
    .get(helpers.checkAuth, IOUsers.read)
    .put(helpers.checkAuth, IOUsers.update)
    .delete(helpers.checkAuth, IOUsers.delete);

  app.route('/private/teachers/available')
    .get(helpers.checkAuth, IOUsers.getAvailabe);

};
