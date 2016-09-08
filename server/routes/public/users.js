'use strict';

const Users = require('../../controllers/public/users');

module.exports = (app) => {

  app.route('/users')
    .post(Users.create);

  app.route('/users/:userId')
    .get(Users.read)
    .put(Users.update);

};
