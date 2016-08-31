'use strict';

const path = require('path'),
  env = process.env.NODE_ENV || 'development',
  crypto = require('crypto'),
  iplocation = require('iplocation'),
  partialResponse = require('./middleware/partial-response'),
  config = require('./config/auth'),
  sendgrid = require('sendgrid')(process.env.NODE_ENV === 'production' ? config.sendgrid.prod : config.sendgrid.qa),
  request = require('request'),
  admin_helpers = require('./admin_helpers');

// Root directory for the server
module.exports.rootServer = __dirname;
module.exports.root = path.join(__dirname, '../');

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

module.exports.isProd = () => {
  return !process.env.ENV_QA && process.env.NODE_ENV === 'production';
};

module.exports.basePath = () => {
  let path = 'https://localhost:3040';

  if (module.exports.isProd()) {
    path = 'https://www.coderhouse.com';
  } else if (process.env.ENV_QA) {
    path = 'https://ch-www-qa.herokuapp.com';
  } else if (process.env.ENV_DEV) {
    path = 'https://ch-www-dev.herokuapp.com';
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
      host += ':3002';
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
  return crypto.createHmac('sha1', 'coderhouse')
    .update(new Date().getHours().toString() + secret).digest('hex');
};

module.exports.createToken = createToken;

module.exports.checkAuth = (req, res, next) => {
  let token = createToken('coderhouse');
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

const _ = require('lodash'),
  fs = require('fs');

const mails = {
  ar: 'hola@coderhouse.com',
  cl: 'chile@coderhouse.com',
  uy: 'uruguay@coderhouse.com'
};

const isProd = !process.env.ENV_QA && process.env.NODE_ENV === 'production';
const isQA = process.env.ENV_QA && process.env.NODE_ENV === 'production';

module.exports.sendEmail = (mail, cb) => {
  var request = sendgrid.emptyRequest();
  request.method = 'POST';
  request.path = '/v3/mail/send';
  request.body = mail.toJSON();
  sendgrid.API(request, function (response) {
    // console.log(response.statusCode);
    // console.log(response.body);
    // console.log(response.headers);
    if (cb) {
      cb();
    }
  });
};

module.exports.sendCertificationMail = (params, cb) => {
  params = params || {};
  params.tpl = params.tpl || {};
  params.tpl.path = './crons/certifications/certification-mail.tpl.html';

  fs.readFile(params.tpl.path, (err, html) => {
    fs.readFile(params.tpl.params.certFilePath, (err, cert) => {
      var helper = require('sendgrid').mail;

      var from_email = new helper.Email('alumnos@coderhouse.com', 'Coderhouse');
      var to_email = new helper.Email(params.toEmail);
      var content = new helper.Content('text/html', _.template(html)(params.tpl.params || params));
      var mail = new helper.Mail(from_email, 'Certificacion', to_email, content);

      var attachment = new helper.Attachment();
      attachment.setContent(cert);
      attachment.setType('application/pdf');
      attachment.setFilename('certificacion_' + new Date().getTime() + '.pdf');
      attachment.setDisposition('attachment');
      mail.addAttachment(attachment);

      module.exports.sendEmail(mail);
    });
  });
};

module.exports.getGeo = (req, res, cb) => {
  let doc = {
    success: true,
    country: 'Argentina',
    iso: 'ar'
  };
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
  ip = ip.length < 15 ? ip : ip.slice(7);

  if (ip !== '127.0.0.1' || ip !== '::1') {
    iplocation(ip, (err, loc) => {
      if (!err) {
        switch (loc.country_code ? loc.country_code.toLowerCase() : 'ar') {
        case 'cl':
          doc.country = 'Chile';
          doc.iso = 'cl';
          break;
        case 'uy':
          doc.country = 'Uruguay';
          doc.iso = 'uy';
          break;
        default:
          doc.country = 'Argentina';
          doc.iso = 'ar';
          break;
        }
        cb(doc);
      } else {
        cb(doc);
      }
    });
  } else {
    cb(doc);
  }
};

module.exports.isProd = () => {
  return isProd;
};

module.exports.isQA = () => {
  return isQA;
};

module.exports.domains = () => {
  let domains = {};
  if (isProd) {
    domains.web = 'https://www.coderhouse.com/';
    domains.dash = 'http://dash.coderhouse.com/';
    domains.api = 'https://api.coderhouse.com/';
  } else if (isQA) {
    domains.web = 'http://ch-www-qa.herokuapp.com/';
    domains.dash = 'http://ch-dash-qa.herokuapp.com/';
    domains.api = 'http://ch-api-qa.herokuapp.com/';
  } else {
    domains.web = 'https://localhost:3040/';
    domains.dash = 'https://localhost:3043/';
    domains.api = 'https://localhost:3002/';
  }

  return domains;
};
