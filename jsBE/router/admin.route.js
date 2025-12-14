const express = require("express");
const router = express.Router();
const {  restartPM2Server, startPM2Server, stopPM2Server } = require('../controller/admin.controller');

router.get('/restartPM2Server', restartPM2Server);
router.get('/startPM2Server', startPM2Server);
router.get('/stopPM2Server', stopPM2Server);


module.exports = router;
