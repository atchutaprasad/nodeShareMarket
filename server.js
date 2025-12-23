// Add express in our project
var express = require('express');
// load environment variables early
require('dotenv').config();
const db = require('./jsBE/db');

//const { Server } = require("socket.io");
//const http = require("http");
//const server = http.createServer(app);
//const io = new Server(server);

// Creating the express app
var app = express();
const path = require('path'); // Required for absolute paths
//var socketIo = require('socket.io');

// initialize axios interceptors (adds common headers + Authorization)
//require('./jsBE/axiosInterceptor');
const basicAuth = require('./jsBE/middleware/basicAuth');

app.use(express.json());
// Serve admin page via protected route
app.get('/admin.html', basicAuth, function (req, res) {
   res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

const loginLogoutRoute = require("./jsBE/router/loginLogout.route");
app.use("/api/log", loginLogoutRoute);

const chekerRoute = require("./jsBE/router/checker.route");
app.use("/api/checker", chekerRoute);

const intradayRoute = require("./jsBE/router/intraday.route");
app.use("/api/intraday", intradayRoute);

const adminRoute = require("./jsBE/router/admin.route");
app.use("/api/admin", adminRoute);

const luckyRoute = require("./jsBE/router/lucky.route");
app.use("/api/lucky", luckyRoute);

app.get("/", function (req, res) {
   res.sendFile(__dirname + "/index.html");
})

// Start DB then server
db.connectWithRetry().then(() => {
   //console.log('Connected to DB');
   // Start the server only after DB connection is established

   var port = process.env.PORT || 3000;
   var server = app.listen(port, function () {
      console.log(__dirname + '  -  ' + new Date() + ' Server is running on port ' + port);
   })
   //console.log('Server listening on port -' + process.env.PORT);
   // Setup socket.io for real-time communication  
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
   console.error('Failed to connect to DB:', e && e.message ? e.message : e);
   process.exit(1);
})
