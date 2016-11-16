'use strict';

module.exports = (app) => {

  app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, X-UserId, X-Nonce' +
      ', X-Secret, X-Ts, X-Sig, X-Vendor-Sig, X-Vendor-Apikey, X-Vendor-Nonce, X-Vendor-Ts, X-ProfileId' +
      ', X-Authorization, Authorization, Token, Pragma, Cache-Control, Expires');
    res.header('Access-Control-Allow-Methods', 'HEAD,OPTIONS,GET,PUT,POST,DELETE');
    next();
  });

  let loadPrivate = () => {
    require('./private/auth')(app);
    require('./private/users')(app);
    require('./private/capacitationCenters')(app);
    require('./private/users')(app);
  };

  let loadPublic = () => {
    require('./public/users')(app);
    require('./public/capacitationCenters')(app);
    require('./public/emergencies')(app);
  };

  loadPrivate();
  loadPublic();

  app.all('/', (req, res, next) => {
    let host = req.hostname;
    if (process.env.NODE_ENV === 'development' || host === 'localhost') {
      res.redirect(301, 'https://localhost:3040');
    } else if (host === 'ch-api-qa.herokuapp.com') {
      res.redirect(301, 'https://sos-www-qa.herokuapp.com');
    } else if (host === 'ch-api.herokuapp.com' || host === 'api.voluntariosos.com') {
      res.redirect(301, 'https://www.voluntariosos.com');
    }
  });
};