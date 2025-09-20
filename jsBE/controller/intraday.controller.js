var axios = require("axios");
const mongoose = require('mongoose');
const parameters = require('../parameters.js');

const insertRawStokes = async (req, res) => {
    const authorization = req.headers['authorization'];
    let config = parameters.loadRawStokesParams(authorization);
    await axios(config).then((response) => {
        const arr = response.data;
        var x = [];
        console.time('for loop');
        const noNumber = /^[^0-9]*$/;
        const noEQ = /EQ/
        for (let i = 0, len = arr.length; i < len; i++) {
            if (arr[i].exch_seg === 'NSE' && arr[i].expiry === '' && noNumber.test(arr[i].name) && noEQ.test(arr[i].symbol)) {
                x.push(arr[i])
            }
        }
        console.timeEnd('for loop');
        res.json({ "x": x })
    }).catch((error) => { res.json(error); });
};

const insertIntradayStokes = async (req, res) => {
    const authorization = req.headers['authorization'];
    let config = parameters.intradayStokesParams(authorization);
    await axios(config).then((response) => { res.json(response.data); }).catch((error) => { res.json(error); });
}


module.exports = {
    insertRawStokes, insertIntradayStokes
};