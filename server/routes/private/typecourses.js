'use strict';

const helpers = require('../../helpers'),
  Typecourses = require('../../controllers/typecourses');

module.exports = (app) => {

  app.route('/private/typecourses')
    .get(helpers.checkAuth, Typecourses.read);

};