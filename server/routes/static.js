'use strict';

const express = require('express'),
  helpers = require('../helpers'),
  partialResponse = require('../middleware/partial-response'),
  env = process.env.NODE_ENV || 'development';

module.exports = (app) => {

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    res.header('Cache-Control', 'no-cache');
    next();
  });

  //app.use(partialResponse.setFields);

  if (env === 'development') {
    app.use(express.static(helpers.root + '/app'));
    app.use(express.static(helpers.root + '/.tmp'));
  }

  if (env === 'qa' || env === 'production') {
    app.use(express.static(helpers.root + '/dist'));
  }

  // Fast 404 for assets not found
  app.get(/^\/(fonts|images|scripts|styles)\/.*/, (req, res) => {
    res.status(404);
    res.sendFile(
      helpers.root +
      env === 'development' ? 'app/404.html' : 'dist/404.html'
    );
  });

};
