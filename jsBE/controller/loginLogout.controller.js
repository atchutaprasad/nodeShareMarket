var axios = require("axios");
const mongoose = require('mongoose');

const parameters = require('../parameters.js');
let Intraday = require('../scema/intradayStoke.model');
let autoLogin = require('../scema/loginDetails.model');
let intradayController = require('./intraday.controller');
let RawStokes = require('../scema/rawStoke.model');



const login = async (req, res) => {
   let loginParams = parameters.loginParams(req.query.totp);
   await axios(loginParams).then(async (loginResponse) => {
      res.json(loginResponse.data);
   }).catch((error) => { res.json(error); });
};

const logOut = async (req, res) => {
   //await mongoose.disconnect();
   const authorization = req.headers['authorization'];
   let config = parameters.logOutParams(authorization);
   await axios(config).then((response) => { res.json(response.data); }).catch((error) => { res.json(error); });
}


const fullyAutomateLogOut = async (req, res) => {
   try {
      await autoLogin.deleteMany({});
      await Intraday.deleteMany({});
      await RawStokes.deleteMany({});
      res.json({ message: 'Logged out successfully', status: true });
   } catch (error) {
      res.json({ message: error.message });
   }
}

const fullyAutomateLogin = async (req, res) => {
   try {


      await autoLogin.deleteMany({});
      let loginParams = parameters.loginParams(req.query.totp);
      const fullyAutomateLoginDetails = await axios(loginParams);
      //console.log(fullyAutomateLoginDetails.data);
      // Save the session details to MongoDB
      // Create a new document using the model and save it to the database
      const loginDetails = new autoLogin({ session: fullyAutomateLoginDetails.data });
      await loginDetails.save();
      // Fetch and return all login details from the database
      const authorization = 'Bearer ' + fullyAutomateLoginDetails.data.data.jwtToken;
      let intradayConfig = parameters.intradayStokesParams(authorization);
      const intradayStokeAPI = await axios(intradayConfig);
      await Intraday.deleteMany({});
      const intradayStokes = intradayStokeAPI.data.data.map(item => {
         item.name = item.SymbolName;
         delete item.SymbolName;
         return new Intraday(item);
      });
      await Intraday.insertMany(intradayStokes);
      let rawConfig = parameters.loadRawStokesParams(authorization);
      const rawStokeAPI = await axios(rawConfig);
      const rawStokesfilteredData = await intradayController.rawStokesFilter(rawStokeAPI.data);
      await RawStokes.deleteMany({});
      const RawStokesStokes = rawStokesfilteredData.map(item => new RawStokes(item));
      await RawStokes.insertMany(RawStokesStokes);
      const intradayResults = await intradayController.fullyAutomateFetchIntradayStokes();

      res.json(intradayResults);
   } catch (error) { res.json({ message: error.message }); }

};

module.exports = {
   login, logOut, fullyAutomateLogin, fullyAutomateLogOut
};