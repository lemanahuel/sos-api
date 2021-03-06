const express = require('express'),
  http = require('http'),
  https = require('https'),
  fs = require('fs'),
  compression = require('compression'),
  helmet = require('helmet'),
  //cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  helpers = require('./helpers'),
  session = require('express-session'),
  RedisStore = require('connect-redis')(session),
  app = express(),
  path = require('path'),
  port = process.env.PORT || 3001,
  credentials = {
    key: fs.readFileSync(path.join(__dirname, '/cert/server.key'), 'utf8'),
    cert: fs.readFileSync(path.join(__dirname, '/cert/server.crt'), 'utf8')
  };

// Dev logger
if (process.env.NODE_ENV === 'development') {
  app.use(require('morgan')('dev'));
}

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(compression());
app.use(helpers.forceHttps);
app.use(helmet());

app.set('trust proxy', 1); // trust first proxy
app.use(session({
  store: new RedisStore(),
  secret: 'voluntariosos secret key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true
  }
}));

require('./routes/static')(app);
require('./config/config')(app);
require('./config/passport')(app);
require('./routes/routes')(app);
// If dev create https server, in production Heroku handles this
if (process.env.NODE_ENV === 'development') {
  https.createServer(credentials, app).listen(port);
} else {
  http.createServer(app).listen(port);
}

console.log('SOS-API application started on port ' + port);

// Expose app
module.exports = app;