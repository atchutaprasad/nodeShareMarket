var axios = require("axios");
const mongoose = require('mongoose');
const parameters = require('../parameters.js');

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
    res.json({ message: req.selectedStoke });
}

module.exports = {
    generateToken, profileDetails, rmsDetails, stokeSelected
};