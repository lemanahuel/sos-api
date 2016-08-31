'use strict';

const Jobs = require('../../controllers/jobs');

module.exports = (app) => {

  app.route('/jobs')
    .get(Jobs.list)
    .post(Jobs.create);
  app.route('/jobs/:jobId').get(Jobs.read);
  app.route('/jobs/slug/:jobSlug').get(Jobs.read);
  app.route('/jobs/:jobId/postulate').post(Jobs.createPostulate);

};
