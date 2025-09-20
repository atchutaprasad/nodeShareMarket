const express = require("express");
const router = express.Router();
const { login, logOut } = require('../controller/loginLogout.controller');

router.get('/login', login);
router.get('/logout', logOut)


module.exports = router;