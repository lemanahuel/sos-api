'use strict';

const jsonMask = require('json-mask'),
  compile = jsonMask.compile,
  filter = jsonMask.filter;

module.exports = class PartialResponse {
  static partialize(obj, fields) {
    if (!fields) {
      return obj;
    }
    return filter(obj, compile(fields));
  }

  static setFields(req, res, next) {
    if (req.query.fields) {
      res.__partialResponseFields = req.query.fields;
    }
    next();
  }

  static wrap(res, json) {
    if (res.__partialResponseFields) {
      res.__isJSONMaskWrapped = true;
      return PartialResponse.partialize(json, res.__partialResponseFields);
    }
    return json;
  }
};
