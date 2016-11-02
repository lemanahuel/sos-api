'use strict';

const Messages = require('../../controllers/public/messages');

module.exports = (app) => {

  app.route('/messages').post(Messages.send);

};