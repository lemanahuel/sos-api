'use strict';

const helpers = require('../../helpers'),
  cloudinary = require('cloudinary'),
  multipart = require('connect-multiparty')(),
  _ = require('lodash');

module.exports = (app) => {

  app.route('/private/upload-image')
    .post(helpers.checkAuth, multipart, (req, res, next) => {
      if (req.files) {
        _.each(Object.keys(req.files), (field) => {
          let options = {};

          if (req.files[field].path.indexOf('.webm') !== -1) {
            options.resource_type = 'raw';
          }

          cloudinary.uploader.upload(req.files[field].path, (result) => {
            let url = result.url;
            // if (process.env.CLOUDINARY_PROXY_CNAME) {
            //   url = url.replace(/res\.cloudinary\.com/, process.env.CLOUDINARY_PROXY_CNAME);
            // }
            url = url.replace(/http:\/\//, 'https://');
            helpers.handleResponse(res, null, {
              url: url
            }, next);
          }, options);
        });
      }
    });
};
