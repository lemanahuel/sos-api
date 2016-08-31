'use strict';

const Courses = require('../../controllers/courses');

module.exports = (app) => {

  app.route('/courses').get(Courses.read);
  app.route('/courses/:courseId').get(Courses.readById);

  app.route('/courses/confirm-coworking/:courseId/:name/:address').get(Courses.confirmCourseCoworking);

};
