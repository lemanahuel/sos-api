'use strict';

const helpers = require('../../helpers'),
  Subscriptions = require('../../controllers/subscriptions');

module.exports = (app) => {

  app.route('/private/subscriptions')
    .get(helpers.checkAuth, Subscriptions.read);

  app.route('/private/subscriptions/:subscriptionId')
    .delete(helpers.checkAuth, Subscriptions.delete);

};