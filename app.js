var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mypRouter = require('./routes/businessplanner');
const flash = require('connect-flash');
const fileUpload = require('express-fileupload');

var app = express();

const port = 4002;

// app.use(fileUpload());

app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const oneDay = 1000 * 24 * 60 * 60;

app.use(session({
  secret: 'thesecretionougalwertyghjklpaijconsjdx',
  saveUninitialized: true,
  cookie: {maxAge: oneDay},
  resave: false
}));

//* sets the flash middleware for flash messages
app.use(flash());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(function(req, res, next) {
  res.locals.message = req.flash()
  next()
})

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/businessplanner', mypRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.error = req.flash("error")
  res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
  next()
});

app.listen(port, function () {
  console.log('Example app listening on port ' + port + '!');
});

module.exports = app;
