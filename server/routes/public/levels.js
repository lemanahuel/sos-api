'use strict';

const Levels = require('../../controllers/levels');

module.exports = (app) => {

  app.route('/levels').get(Levels.read);
  app.route('/levels/:levelId').get(Levels.readById);
  app.route('/levels/slug/:levelSlug').get(Levels.readBySlug);
  //app.route('/levels/career/:careerId').get(Levels.readCareerById);

};
