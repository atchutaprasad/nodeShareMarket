var axios = require('../axiosInterceptor');
const mongoose = require('mongoose');
const parameters = require('../parameters.js');
let LoginDetails = require('../scema/loginDetails.model');

const generateToken = async (req, res) => {
    let tokenParams = parameters.generateToken(req.query.refreshToken);
    await axios(tokenParams).then((response) => {
        res.json(response.data);
    }).catch((error) => { res.json(error); });
};

const profileDetails = async (req, res) => {
    let config = parameters.profileDetailsParams();
    await axios(config).then((response) => { res.json(response.data); }).catch((error) => { res.json(error); });
}

const rmsDetails = async (req, res) => {
    let config = parameters.rmsDetailsParams();
    await axios(config).then((response) => { res.json(response.data); }).catch((error) => { res.json(error); });
}

const stokeSelected = (req, res) => {
    res.json({ message: req.body.selectedStoke });
}

const fullyAutomateProfileDetails = async (req, res) => {
    try {
        let config = parameters.profileDetailsParams();
        await axios(config).then((response) => { res.json(response.data); }).catch((error) => { res.json(error); });
    } catch (error) {
        res.json({ message: 'logout', realMessage: error.message, status: false });
    }

}
module.exports = {
    generateToken, profileDetails, rmsDetails, stokeSelected, fullyAutomateProfileDetails
};