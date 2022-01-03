var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const FileStore = require('session-file-store')(session);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');

const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/nucampsite';
const connect = mongoose.connect(url, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

connect.then(() => console.log('Connected correctly to server'), 
    err => console.log(err)
);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev')); //morgan looks at the request header and logs the  info from it to the console. 
//then it passes the request and response objects to the next middleware, express.json.
app.use(express.json()); //parsing the request body so we can use it more easy in our app
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser('12345-67890-09876-54321'));

app.use(session({
  name: 'session-id', 
  secret: '12345-67890-09876-54321',
  saveUnintialized: false,
  resave: false,
  store: new FileStore()
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);

function auth(req, res, next) {
  console.log("req.session: ", req.session);
  
  if(!req.session.user) {
    //checking is the client not have a session/not authenticated
    const err = new Error('You are not authenticated!');
    err.status = 401;
    return next(err);
  //if there is a signed cookie.uservalue in the incoming request
  } else {
    if(req.session.user === 'authenticated') {
        return next();
    } else {
        const err = new Error('You are not authenticated!');  
        err.status = 401;
        return next(err);
    }
  }
}

app.use(auth);
app.use(express.static(path.join(__dirname, 'public')));


app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);


app.use('/', indexRouter);
app.use('/users', usersRouter);

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
});

module.exports = app;
