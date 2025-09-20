var axios = require("axios");
const mongoose = require('mongoose');
const parameters = require('../parameters.js');

const login = async (req, res) => {
   let loginParams = parameters.loginParams(req.query.totp);
   await axios(loginParams).then(async (loginResponse) => {
      res.json(loginResponse.data);
   }).catch((error) => { res.json(error); });
};

const logOut = async (req, res) => {
   await mongoose.disconnect();
   const authorization = req.headers['authorization'];
   let config = parameters.logOutParams(authorization);
   await axios(config).then((response) => { res.json(response.data); }).catch((error) => { res.json(error); });
}


module.exports = {
   login, logOut
};