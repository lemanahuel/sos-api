'use strict';

const Careers = require('../../controllers/careers');

module.exports = (app) => {

  app.route('/careers').get(Careers.read);
  app.route('/careers/:careerId').get(Careers.readById);
  app.route('/careers/slug/:careerSlug').get(Careers.readBySlug);

};
