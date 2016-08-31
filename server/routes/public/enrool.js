'use strict';

const Enrool = require('../../controllers/public/enrool');

module.exports = (app) => {

  app.route('/enrool').post(Enrool.create);

};
