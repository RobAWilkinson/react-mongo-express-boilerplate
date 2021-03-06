
/**
 * Module dependencies.
 */

var express = require('express');
var compression = require('compression');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var csrf = require('csurf');

var winston = require('winston');
var helpers = require('view-helpers');
var pkg = require('../package.json');
var path = require('path');

var env = process.env.NODE_ENV || 'development';

/**
 * Expose
 */

module.exports = function (app, stormpath) {

  // Compression middleware (should be placed before express.static)
  app.use(compression({
    threshold: 512
  }));

  // Static files middleware
  app.use(express.static(path.resolve(__dirname, '..', 'public')));

  // Use winston on production
  var log;
  if (env !== 'development') {
    log = {
      stream: {
        write: function (message, encoding) {
          winston.info(message);
        }
      }
    };
  } else {
    log = 'dev';
  }

  // Don't log during tests
  // Logging middleware
  if (env !== 'test') app.use(morgan(log));

  // set views path and default layout
  //
  app.set('views', path.resolve(__dirname, '..', 'app/views'));
  app.set('view engine', 'jade');

  // expose package.json to views
  app.use(function (req, res, next) {
    res.locals.pkg = pkg;
    res.locals.env = env;
    next();
  });

  // bodyParser should be above methodOverride
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());
  app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      var method = req.body._method;
      delete req.body._method;
      return method;
    }
  }));

  var url;
  if(process.env.MONGO_1_PORT) {
    url = process.env.MONGO_1_PORT.replace('tcp', 'mongodb');
  } else if(process.env.MONGODB_URI) {
    url = process.env.MONGODB_URI;
  } else {
    url = 'mongodb://localhost/kennedy'; // Use connect method to connect to the Server
  }
  // cookieParser should be above session
  app.use(cookieParser());


  // connect flash for flash messages - should be declared after sessions
  // should be declared after session and flash
  app.use(helpers(pkg.name));

  // adds CSRF support
  // if (process.env.NODE_ENV !== 'test') {
  //   app.use(csrf());

  //   // This could be moved to view-helpers :-)
  //   app.use(function(req, res, next){
  //     res.locals.csrf_token = req.csrfToken();
  //     next();
  //   });
  // }
};
