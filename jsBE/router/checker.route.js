const express = require("express");
const router = express.Router();
const { generateToken, profileDetails, rmsDetails, stokeSelected } = require('../controller/checker.controller');

router.get('/generateToken', generateToken);
router.get('/profileDetails', profileDetails);
router.get('/rmsDetails', rmsDetails);
router.get('/stokeSelected', stokeSelected);


module.exports = router;
