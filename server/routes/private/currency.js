'use strict';

const helpers = require('../../helpers'),
  Curreny = require('../../controllers/currency');

module.exports = (app) => {

  app.route('/private/currency')
    .get(Curreny.read)
    .post(helpers.checkAuth, Curreny.create);

  app.route('/private/currency/:currencyId')
    .get(helpers.checkAuth, Curreny.readById)
    .put(helpers.checkAuth, Curreny.update)
    .delete(helpers.checkAuth, Curreny.delete);

};
