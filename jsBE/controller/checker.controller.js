var axios = require("axios");
const mongoose = require('mongoose');
const parameters = require('../parameters.js');
let LoginDetails = require('../scema/loginDetails.model');

const generateToken = async (req, res) => {
    const authorization = req.headers['authorization'];
    let tokenParams = parameters.generateToken(authorization, req.query.refreshToken);
    await axios(tokenParams).then((response) => {
        res.json(response.data);
    }).catch((error) => { res.json(error); });
};

const profileDetails = async (req, res) => {
    const authorization = req.headers['authorization'];
    let config = parameters.profileDetailsParams(authorization);
    await axios(config).then((response) => { res.json(response.data); }).catch((error) => { res.json(error); });
}

const rmsDetails = async (req, res) => {
    const authorization = req.headers['authorization'];
    let config = parameters.rmsDetailsParams(authorization);
    await axios(config).then((response) => { res.json(response.data); }).catch((error) => { res.json(error); });
}

const stokeSelected = (req, res) => {
    res.json({ message: req.body.selectedStoke });
}

const fullyAutomateProfileDetails = async (req, res) => {
    try {
        let loginDetailsObj = await LoginDetails.find({});
        const authorization = 'Bearer ' + loginDetailsObj[0].session.data.jwtToken;
        let config = parameters.profileDetailsParams(authorization);
        await axios(config).then((response) => { res.json(response.data); }).catch((error) => { res.json(error); });
    } catch (error) {
        res.json({ message: 'logout', realMessage: error.message, status: false });
    }

}
module.exports = {
    generateToken, profileDetails, rmsDetails, stokeSelected, fullyAutomateProfileDetails
};