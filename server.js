// Add express in our project
var express = require('express');

// Creating the express app
var app = express();
const path = require('path'); // Required for absolute paths

//var bodyParser = require('body-parser');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(function (req, res, next) {
   res.setTimeout(120000, function () {
      console.log('Request has timed out.');
      res.send(408);
   });

   next();
});
let { SmartAPI, WebSocket, WebSocketV2 } = require('smartapi-javascript');
var axios = require("axios");
const nodeJS = require('./jsBE/node');
const angleOneJS = require('./jsBE/angleOne');


app.get("/", function (req, res) {
   res.sendFile(__dirname + "/index.html");
})


app.post('/api/stokeSelected', (req, res) => {
   res.json(nodeJS.stokeRender(req.body));
});

// app.get('/api/forLoopTest', (req, res) => {
//    const arr = Array(9999).fill(3);
//    var x = 0;
//     console.time('for loop');
//     for (let i = 0, len = arr.length; i < len; i++) {
//         x = x + arr[i]
//     }
//     console.timeEnd('for loop');
//    res.json({"x": x})
// });

app.get('/api/login', async (req, res) => {
   let loginParams = angleOneJS.loginParams(req.query.totp);
   await axios(loginParams).then(async (loginResponse) => {
      res.json(loginResponse.data);
   }).catch((error) => { res.json(error); });
});

app.get('/api/generateToken', async (req, res) => {
   const authorization = req.headers['authorization'];
   let tokenParams = angleOneJS.generateToken(authorization, req.query.refreshToken);
   await axios(tokenParams).then((response) => {
      res.json(response.data);
   }).catch((error) => { res.json(error); });
});

app.get('/api/profileDetails', async (req, res) => {
   const authorization = req.headers['authorization'];
   let config = angleOneJS.profileDetailsParams(authorization);
   await axios(config).then((response) => { res.json(response.data); }).catch((error) => { res.json(error); });
});

app.get('/api/rmsDetails', async (req, res) => {
   const authorization = req.headers['authorization'];
   let config = angleOneJS.rmsDetailsParams(authorization);
   await axios(config).then((response) => { res.json(response.data); }).catch((error) => { res.json(error); });
});

app.get('/api/loadRawStokes', async (req, res) => {
   //res.set('keep-alive', 'timeout=50'); // 
   const authorization = req.headers['authorization'];
   let config = angleOneJS.loadRawStokesParams(authorization);
   await axios(config).then((response) => {
      const arr = response.data;
      var x = [];
      console.time('for loop');
      const noNumber = /^[^0-9]*$/;
      const noEQ = /EQ/
      for (let i = 0, len = arr.length; i < len; i++) {
         if (arr[i].exch_seg === 'NSE' && arr[i].expiry === '' && noNumber.test(arr[i].name) &&  noEQ.test(arr[i].symbol)) {
            x.push(arr[i])
         }
      }
      console.timeEnd('for loop');
      res.json({ "x": x })
   }).catch((error) => { res.json(error); });
});

app.get('/api/intradayStokes', async (req, res) => {
   const authorization = req.headers['authorization'];
   let config = angleOneJS.intradayStokesParams(authorization);
   await axios(config).then((response) => { res.json(response.data); }).catch((error) => { res.json(error); });
});

app.get('/api/logOut', async (req, res) => {
   const authorization = req.headers['authorization'];
   let config = angleOneJS.logOutParams(authorization);
   await axios(config).then((response) => { res.json(response.data); }).catch((error) => { res.json(error); });
});


var port = 3000;
app.listen(port, function () {
   console.log(__dirname + '  -  ' +  new Date());
})