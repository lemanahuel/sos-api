'use strict';

const path = require('path'),
  env = process.env.NODE_ENV || 'development',
  crypto = require('crypto'),
  iplocation = require('iplocation'),
  partialResponse = require('./middleware/partial-response');

// Root directory for the server
module.exports.rootServer = __dirname;
module.exports.root = path.join(__dirname, '../');

module.exports.basePath = () => {
  let path = 'https://localhost:3040';

  if (module.exports.isProd()) {
    path = 'https://www.voluntariosos.com';
  } else if (process.env.ENV_QA) {
    path = 'https://sos-www-qa.herokuapp.com';
  } else if (process.env.ENV_DEV) {
    path = 'https://sos-www-dev.herokuapp.com';
  }

  return path;
};

// Handle every response back to the client
let handleResponse;
module.exports.handleResponse = handleResponse = (res, err, doc, next) => {
  if (err) {
    console.log(err);
    if (next) {
      next(err);
    } else if (res) {
      res.status(err.httpCode || 400).json(err);
    }
  } else {
    res.status(200).json(partialResponse.wrap(res, doc));
  }
};

module.exports.forceHttps = (req, res, next) => {
  let host = req.hostname;

  if (!req.secure) {

    if (env === 'development') {
      host += ':3001';
    }

    if (req.method === 'GET' || req.method === 'HEAD') {
      res.redirect(301, 'https://' + host + req.url);
    } else {
      res.redirect(308, 'https://' + host + req.url);
    }
  } else {
    next();
  }
};

let createToken = (secret) => {
  return crypto.createHmac('sha1', 'voluntariosos')
    .update(new Date().getHours().toString() + secret).digest('hex');
};

module.exports.createToken = createToken;

module.exports.checkAuth = (req, res, next) => {
  let token = createToken('voluntariosos');
  let headerToken = req.headers.token;
  if (headerToken && headerToken === token) {
    next();
  } else if (admin_helpers.domainWhiteList(req.headers.origin)) {
    next();
  } else {
    res.send({
      error: 'expired'
    });
  }
};

module.exports.getRandomString = () => {
  var timestamp = new Date().getTime().toString();
  return crypto.createHmac('sha1', '123456')
    .update(timestamp)
    .digest('hex');
};

module.exports.isAuthenticatedRes = (req, res, next) => {
  handleResponse(res, null, {
    valid: true
  }, next);
};

module.exports.isProd = () => {
  return !process.env.ENV_QA && process.env.NODE_ENV === 'production';
};

module.exports.isQA = () => {
  return process.env.ENV_QA && process.env.NODE_ENV === 'production';
};

module.exports.domains = () => {
  let domains = {};
  if (isProd) {
    domains.web = 'https://www.voluntariosos.com/';
    domains.admin = 'https://admin.voluntariosos.com/';
    domains.api = 'https://api.voluntariosos.com/';
  } else if (isQA) {
    domains.web = 'http://sos-www-qa.herokuapp.com/';
    domains.admin = 'https://sos-admin-qa.herokuapp.com/';
    domains.api = 'http://sos-api-qa.herokuapp.com/';
  } else {
    domains.web = 'https://localhost:3040/';
    domains.admin = 'https://localhost:3002/';
    domains.api = 'https://localhost:3001/';
  }

  return domains;
};