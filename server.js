// Add express in our project
var express = require('express');
const mongoose = require('mongoose');

// Creating the express app
var app = express();
const path = require('path'); // Required for absolute paths

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

const loginLogoutRoute = require("./jsBE/router/loginLogout.route");
app.use("/api/log", loginLogoutRoute);

const chekerRoute = require("./jsBE/router/checker.route");
app.use("/api/checker", chekerRoute);

const intradayRoute = require("./jsBE/router/checker.route");
app.use("/api/intraday", intradayRoute);



app.get("/", function (req, res) {
   res.sendFile(__dirname + "/index.html");
})

mongoose.connect("mongodb+srv://atchutaprasad_db_user:google2020@backendnodestokemarketd.crqxvr0.mongodb.net/stokes-API?retryWrites=true&w=majority&appName=BackEndNodeStokeMarketDB").then(() => {
   var port = 3000;
   app.listen(port, function () {
      console.log(__dirname + '  -  ' + new Date());
   })
}).catch((e) => {
   console.log(e)
})