const express = require("express");
const router = express.Router();

//router.get('/luckyDraw', require('../controller/lucky.controller').luckyDraw);

router.get('/history', require('../controller/lucky.controller').getHistory);


module.exports = router;
