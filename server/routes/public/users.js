'use strict';

const Users = require('../../controllers/public/users');

module.exports = (app) => {

  app.route('/users')
    .get(Users.list)
    .post(Users.create);

  app.route('/users/:userId')
    .get(Users.read)
    .post(Users.update);

};