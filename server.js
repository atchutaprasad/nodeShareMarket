// Add express in our project
var express = require('express');

// Creating the express app
var app = express();
const path = require('path'); // Required for absolute paths

var bodyParser = require('body-parser');

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

app.post("/data", function (req, res) {
   res.send("We have got the post request on /data route");
})

app.post('/api/stokeSelected', (req, res) => {
   res.json(nodeJS.stokeRender(req.body));
});

app.get('/api/generateSession', async (req, res) => {
   res.json(angleOneJS.generateSession(req));
});

app.get('/api/loginAngleOne', async (req, res) => {

   var data = JSON.stringify({
      "clientcode": "V112910",
      "password": "1984",
      "totp": req.query.totp,
      "state": "prasadtest"
   });
   var config = {
      method: 'post',
      url: 'https://apiconnect.angelone.in/rest/auth/angelbroking/user/v1/loginByPassword',
      headers: {
         'Content-Type': 'application/json',
         'Accept': 'application/json',
         'X-UserType': 'USER',
         'X-SourceID': 'WEB',
         'X-ClientLocalIP': '192.168.0.108',
         'X-ClientPublicIP': '192.168.0.1',
         'X-MACAddress': 'E4-B9-7A-08-0D-2B',
         'X-PrivateKey': 'jkFNrQQQ '
      },
      data: data
   };
   await axios(config)
      .then(function (response) {
         res.json(JSON.stringify(response.data));
      })
      .catch(function (error) {
         res.json(error);
      });
});

app.get('/api/data', (req, res) => {
   res.json({ message: nodeJS.greet('World') });
});

// WE ARE ALLOWING OUR APP TO LISTEN ON PORT 3000
var port = 3000;
app.listen(port, function () {
   console.log(__dirname)
   console.log("Server started successfully at port 3000!");
   // let smart_api = new SmartAPI({
   //    api_key: 'jkFNrQQQ', // PROVIDE YOUR API KEY HERE
   // });
   // smart_api
   //    .generateSession('V112910', 'Google@2020', 'KHGHCZP64XWH7KNK7CL7T6ECR4').then((data) => {
   //       return smart_api.getProfile();
   //    })
   //    .then((data) => {
   //       // Profile details
   //       console.log(data)
   //    })
   //    .catch((ex) => {
   //       console.log(ex)
   //       //Log error
   //    });
})