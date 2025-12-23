const express = require("express");
const router = express.Router();
const {  restartPM2Server, startPM2Server, stopPM2Server, getRefreshMetrics } = require('../controller/admin.controller');
const basicAuth = require('../middleware/basicAuth');

router.get('/restartPM2Server', basicAuth, restartPM2Server);
router.get('/startPM2Server', basicAuth, startPM2Server);
router.get('/stopPM2Server', basicAuth, stopPM2Server);
router.get('/refreshMetrics', basicAuth, getRefreshMetrics);


module.exports = router;
