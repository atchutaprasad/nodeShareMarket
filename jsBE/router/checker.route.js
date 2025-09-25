const express = require("express");
const router = express.Router();
const { generateToken, profileDetails, rmsDetails, stokeSelected, fullyAutomateProfileDetails } = require('../controller/checker.controller');

router.get('/generateToken', generateToken);
router.get('/profileDetails', profileDetails);
router.get('/fullyAutomateProfileDetails', fullyAutomateProfileDetails);
router.get('/rmsDetails', rmsDetails);
router.post('/stokeSelected', stokeSelected);


module.exports = router;
