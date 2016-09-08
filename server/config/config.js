'use strict';

const db = require('mongoose'),
  env = process.env.NODE_ENV || 'development';

module.exports = (app) => {

  if (env !== 'development') {
    app.enable('trust proxy');
  }
  // Connect to Database
  db.connect(process.env.MONGOLAB_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sos');

  app.use(require('body-parser').json());
  app.use(require('body-parser').urlencoded({
    extended: true
  }));

  app.use(require('method-override')());
  app.use(require('cookie-parser')('43oi3dfs445o3_i5h4i-5h3$oi4f%324f343%'));

  require('cloudinary').config();
};
