'use strict';

module.exports = {
  local: process.env.MONGODB_URI || process.env.MONGOLAB_URI || 'mongodb://127.0.0.1:27017/coderhouse',
  dev: 'mongodb://heroku_kd3rbrrl:t8jm407ujouo46b1tg9c8q3c26@ds051960.mlab.com:51960/heroku_kd3rbrrl',
  qa: 'mongodb://heroku_ltj6bcm2:90lbi9rj1vskl1uc1s625uf6eu@ds023448.mlab.com:23448/heroku_ltj6bcm2',
  prod: 'mongodb://heroku_9rgg78tv:is1i5f43nl26rvghsort5lopo0@ds013651-a0.mlab.com:13651,ds013651-a1.mlab.com:13651/heroku_9rgg78tv?replicaSet=rs-ds013651',
};
