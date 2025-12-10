const express = require("express");
const router = express.Router();
const { insertRawStokes, insertIntradayStokes, fetchIntradayStokes, fullyAutomateLoadStokes, fullyAutomateLTP } = require('../controller/intraday.controller');

router.get('/insertRawStokes', insertRawStokes);
router.get('/insertIntradayStokes', insertIntradayStokes);
router.get('/fetchIntradayStokes', fetchIntradayStokes);
router.get('/fullyAutomateLoadStokes', fullyAutomateLoadStokes);
router.get('/fullyAutomateLTP', fullyAutomateLTP);


module.exports = router;

