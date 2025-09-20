const express = require("express");
const router = express.Router();
const { insertRawStokes, insertIntradayStokes } = require('../controller/intraday.controller');

router.get('/insertRawStokes', insertRawStokes);
router.get('/insertIntradayStokes', insertIntradayStokes);


module.exports = router;

