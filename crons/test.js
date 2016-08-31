moment = require('moment-timezone');

let starHour = moment('1970-01-01T21:30:00.000Z');

 console.log(starHour.tz('America/Argentina/Buenos_Aires').format('HH:mm:ss'));
