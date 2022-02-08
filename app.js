
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



//recieve token and get access and refresh tokens
app.get('/firsttoken', function (req, res) {
  console.log(req.query.code)
  let token= req.query.code //code on starvan "token"
  fetchTokens(token)
  return res.send("You can now return to Juoksee application, first token: "+token)
    
    
})

//fetch accesstoken and refreshtoken
const fetchTokens =(token)=>{
  axios.post("https://www.strava.com/oauth/token",{
    client_id: 76862,
    client_secret: "67401766aa8757e4f2c742595091a8d3014137c6",
    code: token,
    grant_type: "authorization_code"
  })
  .then(response =>{
    let accesstoken = response.data.access_token
    let refreshtoken = response.data.refresh_token
    console.log("ACCESSTOKEN: "+accesstoken+" REFRESHTOKEN: "+refreshtoken)
   
   
    const aTuringRef = db.collection('users').doc('aturing');

     aTuringRef.set({
      'username': 'Alan',
      'accesstoken': accesstoken,
      'refreshtoken': refreshtoken,
      'id': 2
    });

  })
}


app.post('/hello', function (req, res) {
  res.send('Got a POST request')
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
