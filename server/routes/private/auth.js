const Auth = require('../../controllers/private/auth');

module.exports = (app) => {

  app.route('/authenticate').post(Auth.authenticate);
  app.route('/logout').post(Auth.logout);
  app.route('/getToken').get(Auth.getToken);
};