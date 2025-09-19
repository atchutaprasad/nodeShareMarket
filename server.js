// Add express in our project
var express = require('express');
const mongoose = require('mongoose');
const Intraday = require('./jsBE/scema/intradayStoke.model')
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
//const { default: mongoose } = require('mongoose');



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
         if (arr[i].exch_seg === 'NSE' && arr[i].expiry === '' && noNumber.test(arr[i].name) && noEQ.test(arr[i].symbol)) {
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
   await mongoose.disconnect();
   const authorization = req.headers['authorization'];
   let config = angleOneJS.logOutParams(authorization);
   await axios(config).then((response) => { res.json(response.data); }).catch((error) => { res.json(error); });
});

app.delete('/api/insertIntradayList', async (req, res) => {
   try {
      //delete All
      //const result = await Intraday.deleteMany({});
      //console.log(`${result.deletedCount} documents deleted.`);
      //res.status(200).json({})

      //Insert One Record
      //const iStoke = await Intraday.create(req.body);
      //res.status(200).json(iStoke)


      //find one Record - method GET
      // const iStoke = await Intraday.findById('68cd8d5a6cbd710c82caece4');
      // res.status(200).json(iStoke)

      //update one Record - method PUT
      // const iStoke = await Intraday.findByIdAndUpdate('68cd8d5a6cbd710c82caece4', req.body);
      // if(!iStoke){
      //    return res.status(404).json({message: "stoke not found"})
      // }
      // const updatedIstoke = await Intraday.findById('68cd8d5a6cbd710c82caece4')
      // res.status(200).json(updatedIstoke)


      //delete one Record - method delete
      //    const iStoke = await Intraday.findByIdAndDelete('68cd8d5a6cbd710c82caece4', req.body);
      //    if(!iStoke){
      //       return res.status(404).json({message: "stoke not found"})
      //    }
      //   res.status(200).json({message: "stoke deleted succesfully"})

   } catch (error) {
      res.status(500).json({ message: error.message })
   }
});

mongoose.connect("mongodb+srv://atchutaprasad_db_user:google2020@backendnodestokemarketd.crqxvr0.mongodb.net/stokes-API?retryWrites=true&w=majority&appName=BackEndNodeStokeMarketDB").then(() => {
   var port = 3000;
   app.listen(port, function () {
      console.log(__dirname + '  -  ' + new Date());
   })
}).catch((e) => {
   console.log(e)
})