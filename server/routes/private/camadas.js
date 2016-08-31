'use strict';

const helpers = require('../../helpers'),
  Camadas = require('../../controllers/private/camadas');

module.exports = (app) => {

  app.route('/private/camadas')
    .get(helpers.checkAuth, Camadas.list)
    .post(helpers.checkAuth, Camadas.create);

  app.route('/private/camadas/:camadaId')
    .get(helpers.checkAuth, Camadas.read)
    .put(helpers.checkAuth, Camadas.update)
    .delete(helpers.checkAuth, Camadas.delete);

};
