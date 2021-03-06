
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const { default: axios } = require('axios');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Import the functions you need from the SDKs you need
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

const serviceAccount = require('../firebasecreds/urheilukelloappi-creds.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();


//fetch accesstoken and refreshtoken
app.get("/fetchtokens", function(req, res) {
  //gets token as parameter
  
  axios.post("https://www.strava.com/oauth/token",{
    client_id: "CLIENT_ID",
    client_secret: "CLIENT_SECRET",
    code: req.query.token,
    grant_type: "authorization_code"
  })
  .then(response =>{
      if(response.status != 200){
        console.log("error") 
        return
      }
    let accesstoken = response.data.access_token
    let refreshtoken = response.data.refresh_token
    let athleteid = response.data.athlete.id
    console.log(accesstoken +"   :   "+ refreshtoken +" : "+athleteid )

   //firebase save user info 
    const aTuringRef = db.collection('users').doc(athleteid.toString());
      aTuringRef.set({
        'username': response.data.athlete.username,
        'accesstoken': accesstoken,
        'refreshtoken': refreshtoken,
      });
      
      //sends information back to frontend
      res.format({
        'application/json': function () {
          res.send({athleteid: athleteid})
        },
      }) 
  })
})


app.post('/googlelogin', function (req, res) {
})




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
