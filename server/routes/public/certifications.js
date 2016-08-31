'use strict';

const Certifications = require('../../controllers/public/certifications');

module.exports = (app) => {

  app.route('/certifications/:certificationId').get(Certifications.read);
  app.route('/certifications/:certificationId/print').get(Certifications.print);
  app.route('/certifications/:certificationId/download').get(Certifications.download);

};
