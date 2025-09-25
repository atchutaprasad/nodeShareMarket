const express = require("express");
const router = express.Router();
const { login, logOut, fullyAutomateLogin, fullyAutomateLogOut } = require('../controller/loginLogout.controller');

router.get('/login', login);
router.get('/logout', logOut);
router.get('/fullyAutomateLogin', fullyAutomateLogin);
router.get('/fullyAutomateLogOut', fullyAutomateLogOut);


module.exports = router;