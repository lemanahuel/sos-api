'use strict';

const Testimonies = require('../../controllers/public/testimonies');

module.exports = (app) => {

  app.route('/testimonies')
    .get(Testimonies.list)
    .post(Testimonies.create);

};