'use strict';

const helpers = require('../../helpers'),
  Jobs = require('../../controllers/private/jobs');

module.exports = (app) => {

  app.route('/private/jobs')
    .get(helpers.checkAuth, Jobs.read)
    .post(helpers.checkAuth, Jobs.create);

  app.route('/private/jobs/:jobId')
    .get(helpers.checkAuth, Jobs.readById)
    .put(helpers.checkAuth, Jobs.update)
    .delete(helpers.checkAuth, Jobs.delete);

};
