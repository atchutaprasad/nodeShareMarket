// Add express in our project
var express = require('express');

// Creating the express app
var app = express();
const path = require('path'); // Required for absolute paths

//var bodyParser = require('body-parser');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
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

app.get('/api/login', async (req, res) => {
   let loginParams = angleOneJS.loginParams(req.query.totp);
   await axios(loginParams).then(async (loginResponse) => { res.json(loginResponse.data); 
   }).catch((error) => { res.json(error); });
});

app.get('/api/generateToken', async (req, res) => {
   const authorization = req.headers['authorization'];
   let tokenParams = angleOneJS.generateToken(authorization, req.query.refreshToken);
   await axios(tokenParams).then((response) => { res.json(response.data); 
   }).catch((error) => { res.json(error); });
});

app.get('/api/logOut', async (req, res) => {
   const authorization = req.headers['authorization'];
   console.log(authorization)
   let config = angleOneJS.logOutParams(authorization);
   await axios(config).then((response) => { res.json(response.data); }).catch((error) => { res.json(error); });
});


var port = 3000;
app.listen(port, function () {
   console.log(__dirname);
})