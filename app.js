var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
var hbs = require('express-handlebars');
const fileUpload = require('express-fileupload');

var herramientas_inportadas = require('./libs/functions.js');

var expressMongoDb = require('./libs/mongoDB.js');
var confCC = require("./configs.js");
var validator = require("email-validator");

mongoose.connect(confCC.mongoConf.url);
mongoose.Promise = global.Promise;
const db = mongoose.connection

// define rutas
var app = express();

app.engine('html', hbs({
  extname: '.html',
  defaultView: 'default',
  defaultLayout: 'default',
  layoutsDir: __dirname + '/views/layout/',
  partialsDir: __dirname + '/views/partial/'
}));
app.set('view engine', 'html');
app.set('views', __dirname + '/views/pages');
app.use(logger('dev'));
//app.use(fileUpload());
app.use(fileUpload({
  limits: { fileSize: 25 * 1024 * 1024 },
  useTempFiles : true,
  tempFileDir : '/tmp/'
}));
app.use(express.json({
  limit: '25mb'
}));
app.use(express.urlencoded({
  extended: true,
  limit: '25mb'
}));

app.use(express.static(path.join(__dirname, 'public/')));


app.use(expressMongoDb(confCC.mongoConf, {
  property: 'dbMongo',
  useNewUrlParser: true
}));

app.use(session({
  secret: 'sessionSecretKey2021',
  resave: false,
  saveUninitialized: true,
  name: 'myappcookie',
  store: new MongoStore({
    mongooseConnection: db,
    useNewUrlParser: true
  }),
  cookie: {
    httpOnly: true
  }
}));


app.use(function(req, res, next) {
  req.herramientas = herramientas_inportadas
  req.configuraciones=confCC
  next()
});


var indexRouter = require("./routes/index.js");
app.use('/', indexRouter);

// ENABLE SIMPLE AUTH
// var checkauth = require("./libs/simpleauth.js");
// app.use(checkauth);

// app.use(function(req,res,next){
//   res.redirect("/")
// });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
  // res.send(JSON.stringify({
  //   ...err,
  //   tipo:"error",
  //   mensaje:"Cuenta Inactiva"
  // }))
});

module.exports = app;
