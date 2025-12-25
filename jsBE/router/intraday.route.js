const express = require("express");
const router = express.Router();

router.get('/insertRawStokes', require('../controller/intraday.controller').insertRawStokes);
router.get('/insertIntradayStokes', require('../controller/intraday.controller').insertIntradayStokes);
router.get('/fetchIntradayStokes', require('../controller/intraday.controller').fetchIntradayStokes);
router.get('/fullyAutomateLoadStokes', require('../controller/intraday.controller').fullyAutomateLoadStokes);
router.get('/fullyAutomateSelectedStokes', require('../controller/intraday.controller').fullyAutomateSelectedStokes);
router.get('/fullyAutomateLTP', require('../controller/intraday.controller').fullyAutomateLTP);
router.get('/stopFullyAutomateLTP', require('../controller/intraday.controller').stopFullyAutomateLTP);



module.exports = router;

