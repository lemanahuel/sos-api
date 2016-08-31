'use strict';

const helpers = require('../../helpers'),
  Courses = require('../../controllers/private/courses');

module.exports = (app) => {

  app.route('/private/courses')
    .get(helpers.checkAuth, Courses.read)
    .post(helpers.checkAuth, Courses.create);

  app.route('/private/courses/:courseId')
    .get(helpers.checkAuth, Courses.readById)
    .put(helpers.checkAuth, Courses.update)
    .delete(helpers.checkAuth, Courses.delete);

  app.route('/private/courses/:courseId/send-notice-coworking')
    .post(helpers.checkAuth, Courses.sendNoticeCoworking);

  app.route('/private/courses/:courseId/send-notice-teachers')
    .post(helpers.checkAuth, Courses.sendNoticeTeachers);
};
