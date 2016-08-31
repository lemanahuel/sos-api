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

  let loadAdmin = () => {
    require('./admin/schedules')(app);
    require('./admin/camadas')(app);
    require('./admin/classes')(app);
    require('./admin/histories')(app);
    require('./admin/modules')(app);
    require('./admin/profiles')(app);
    require('./admin/stages')(app);
    require('./admin/students')(app);
    require('./admin/teachers')(app);
    require('./admin/tps')(app);
    require('./admin/users')(app);
    require('./admin/remotes')(app);
    require('./admin/feedbacks')(app);
    require('./admin/upload-image')(app);
  };

  let loadPrivate = () => {
    require('./private/auth')(app);
    require('./private/careers')(app);
    require('./private/courses')(app);
    require('./private/currency')(app);
    require('./private/levels')(app);
    require('./private/workshops')(app);
    require('./private/upload-image')(app);
    require('./private/subscriptions')(app);
    require('./private/companies')(app);
    require('./private/users')(app);
    require('./private/countries')(app);
    require('./private/coworkings')(app);
    require('./private/jobs')(app);
    require('./private/recruiters')(app);
    require('./private/io-users')(app);
    require('./private/reports')(app);
    require('./private/camadas')(app);
  };

  let loadPublic = () => {
    require('./public/careers')(app);
    require('./public/courses')(app);
    require('./public/currency')(app);
    require('./public/levels')(app);
    require('./public/purchase')(app);
    require('./public/subscriptions')(app);
    require('./public/workshops')(app);
    require('./public/companies')(app);
    require('./public/countries')(app);
    require('./public/wheeloffortune')(app);
    require('./public/certifications')(app);
    require('./public/jobs')(app);
    require('./public/auth')(app);
    require('./public/enrool')(app);
  };

  loadAdmin();
  loadPrivate();
  loadPublic();

  app.all('/', (req, res, next) => {
    let host = req.hostname;
    if (process.env.NODE_ENV === 'development' || host === 'localhost') {
      res.redirect(301, 'https://localhost:3040');
    } else if (host === 'ch-api-qa.herokuapp.com') {
      res.redirect(301, 'https://ch-www-qa.herokuapp.com');
    } else if (host === 'ch-api.herokuapp.com' || host === 'api.coderhouse.com') {
      res.redirect(301, 'https://www.coderhouse.com');
    }
  });
};
