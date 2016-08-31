'use strict';

const helpers = require('../../admin_helpers');

module.exports = (req, res, next) => {
  if (req.headers.authorization && helpers.domainWhiteList(req.headers.origin)) {
    next();
  } else if (helpers.domainWhiteList(req.headers.origin)) {
    next();
  } else {
    helpers.handleResponse(res, {
      err: 'not-valid-r'
    });
  }
};
