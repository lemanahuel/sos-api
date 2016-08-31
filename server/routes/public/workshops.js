'use strict';

const Workshops = require('../../controllers/workshops');

module.exports = (app) => {

  app.route('/workshops').get(Workshops.read);
  app.route('/workshops/:workshopId').get(Workshops.readById);
  app.route('/workshops/slug/:workshopSlug').get(Workshops.readBySlug);

};
