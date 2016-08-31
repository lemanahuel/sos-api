'use strict';

const Subscriptions = require('../../controllers/subscriptions');

module.exports = (app) => {

  app.route('/subscriptions/newsletter').post(Subscriptions.newsletter);
  app.route('/subscriptions/course').post(Subscriptions.course);
  app.route('/subscriptions/courseinstap').post(Subscriptions.courseInstapage);
  app.route('/subscriptions/business').post(Subscriptions.business);
  app.route('/subscriptions/workshop').post(Subscriptions.workshop);

  app.route('/subscriptions/test').post(Subscriptions.test);
  app.route('/subscriptions/automatic').post(Subscriptions.automatic);
  app.route('/unsubscribe/:subscriptionId').get(Subscriptions.unsubscribe);
  app.route('/unsubscribe/:subscriptionId/next-courses').get(Subscriptions.unsubscribeNextCoursesNewsletter);
  app.route('/unsubscribe/:subscriptionId/jobs').get(Subscriptions.unsubscribeJobsNewsletter);
  app.route('/unsubscribe/:subscriptionId/recruiters').get(Subscriptions.unsubscribeRecruitersNewsletter);

};
