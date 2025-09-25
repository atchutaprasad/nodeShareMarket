// Add express in our project
var express = require('express');
const mongoose = require('mongoose');

//const { Server } = require("socket.io");
//const http = require("http");
//const server = http.createServer(app);
//const io = new Server(server);

// Creating the express app
var app = express();
const path = require('path'); // Required for absolute paths
var socketIo = require('socket.io');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

const loginLogoutRoute = require("./jsBE/router/loginLogout.route");
app.use("/api/log", loginLogoutRoute);

const chekerRoute = require("./jsBE/router/checker.route");
app.use("/api/checker", chekerRoute);

const intradayRoute = require("./jsBE/router/intraday.route");
app.use("/api/intraday", intradayRoute);



app.get("/", function (req, res) {
   res.sendFile(__dirname + "/index.html");
})

mongoose.connect("mongodb+srv://atchutaprasad_db_user:google2020@backendnodestokemarketd.crqxvr0.mongodb.net/stokes-API?retryWrites=true&w=majority&appName=BackEndNodeStokeMarketDB").then(() => {
   var port = 3000;
   var server = app.listen(port, function () {
      console.log(__dirname + '  -  ' + new Date());
   })
   // io = socketIo(server);
   // io.on('connection', (socket) => {
   //    console.log('A user connected');
   //    socket.on('disconnect', () => {
   //       console.log('User disconnected');
   //    });
   // });
   // const interval = 10 * 1000; // 10 seconds

   // setInterval(() => {
   //    const dataToSend = { message: "Live update from server at " + new Date().toLocaleTimeString() };
   //    io.emit('serverData', dataToSend); // Emit data to all connected clients
   // }, interval);
}).catch((e) => {
   console.log(e)
})