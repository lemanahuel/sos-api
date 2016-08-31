'use strict';

const helpers = require('../helpers'),
  _ = require('lodash'),
  async = require('async'),
  Q = require('q'),
  Model = require('../models/coworking').model,
  Course = require('../models/course').model,
  CountryModel = require('../models/country').model,
  moment = require('moment-timezone'),
  timeZone = 'America/Argentina/Buenos_Aires';

module.exports = class Coworking {

  static create(req, res, next) {
    Model.create(req.body, (err, doc) => {
      helpers.handleResponse(res, err, doc, next);
    });
  }

  static list(req, res, next) {
    let displayable = {
      $or: [{
        display: {
          $exists: false
        }
      }, {
        display: true
      }]
    };
    Model.find(displayable).lean().exec((err, docs) => {
      helpers.handleResponse(res, err, docs);
    });
  }

  static read(req, res, next) {
    Model.findById(req.params.coworkingId).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc);
    });
  }

  static update(req, res, next) {
    Model.findByIdAndUpdate(req.params.coworkingId, req.body, {
      new: true
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc, next);
    });
  }

  static delete(req, res, next) {
    Model.findByIdAndUpdate(req.params.coworkingId, {
      $set: {
        display: false
      }
    }, {
      new: true
    }).lean().exec((err, doc) => {
      helpers.handleResponse(res, err, doc, next);
    });
  }

  static getAvailabe(req, res, next) {
    let q = req.query;
    let dateStart = q.startDate ? new Date(q.startDate) : new Date();
    dateStart = moment.tz(dateStart, timeZone).format('YYYY-MM-DDT23:59:59');

    let findParams = {};
    let displayable = {
      $or: [{
        display: {
          $exists: false
        }
      }, {
        display: true
      }]
    };

    findParams.endDate = {
      $gte: new Date(dateStart).getTime()
    };

    let country = null;
    let coworkingsFilterTmp = [];

    if (q.country) {
      findParams.country = q.country;
      CountryModel.find().lean().exec((err, countries) => {
        country = countries.find((item) => {
          return item.code === q.country;
        });

        Model.find(displayable).lean().exec((err, coworkings) => {

          Course.find(_.merge(findParams, displayable))
            .sort('startDate')
            .lean().exec((err, courses) => {
              let locations = [];

              _.each(courses, (item) => {
                if (item.location) {
                  locations.push(item.location);
                }
              });

              _.each(coworkings, (item) => {
                coworkingsFilterTmp.push({
                  _id: item._id,
                  name: item.name,
                  locations: []
                });

                _.each(item.locations, (location) => {
                  if (locations.indexOf(location._id) === -1) {
                    if (country && country._id.toString() === location.country.toString() && location.days) {
                      let filterDay;

                      if (q.fromDay && q.fromDay > 0) {
                        if (q.toDay && q.toDay > 0) {
                          filterDay = location.days.indexOf(Number(q.toDay)) !== -1 && location.days.indexOf(Number(q.fromDay)) !== -1;
                        } else {
                          filterDay = location.days.indexOf(Number(q.fromDay)) !== -1;
                        }
                      } else {
                        filterDay = true;
                      }

                      let filterHour;

                      if (q.startHour) {
                        let startHour = moment.tz(new Date(q.startHour), timeZone).format('HH:mm').split(':');
                        let startHourLoc = moment.tz(new Date(location.startHourWeek), timeZone).format('HH:mm').split(':');
                        filterHour = startHour[0] >= startHourLoc[0] && startHour[1] >= startHourLoc[1];
                        if (q.endHour) {
                          let endHour = moment.tz(new Date(q.endHour), timeZone).format('HH:mm').split(':');
                          let endHourLoc = moment.tz(new Date(location.endHourWeek), timeZone).format('HH:mm').split(':');
                          filterHour = (endHour[0] <= endHourLoc[0] && filterHour);
                        }
                      } else {
                        filterHour = true;
                      }
                      if (filterDay && filterHour) {
                        coworkingsFilterTmp[coworkingsFilterTmp.length - 1].locations.push(location);
                      }
                    }
                  }
                });
              });

              let coworkingsFilter = [];
              _.each(coworkingsFilterTmp, function (item) {
                if (item && item.locations.length) {
                  coworkingsFilter.push(item);
                }
              });

              helpers.handleResponse(res, err, coworkingsFilter, next);
            });
        });
      });
    } else {
      helpers.handleResponse(res, null, {}, next);
    }
  }
};
