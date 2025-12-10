var axios = require("axios");
const mongoose = require('mongoose');

let { SmartAPI, WebSocket, WebSocketV2 } = require('smartapi-javascript');
const parameters = require('../parameters.js');
let RawStokes = require('../scema/rawStoke.model');
let Intraday = require('../scema/intradayStoke.model');
let AutoLogin = require('../scema/loginDetails.model');
let loginLogoutController = require('./loginLogout.controller');
//const WSOrderUpdates = require('smartapi-javascript/src/websocket-order-updates');



const rawStokesFilter = (arr) => {
    var x = [];
    const noNumber = /^[^0-9]*$/;
    const noEQ = /EQ/
    for (let i = 0, len = arr.length; i < len; i++) {
        if (arr[i].exch_seg === 'NSE' && arr[i].expiry === '' && noNumber.test(arr[i].name) && noEQ.test(arr[i].symbol)) { x.push(arr[i]) }
    }
    return x;
};
const insertRawStokes = async (req, res) => {
    const authorization = req.headers['authorization'];
    let config = parameters.loadRawStokesParams(authorization);
    await axios(config).then(async (response) => {
        try {
            const filteredData = await rawStokesFilter(response.data);
            await RawStokes.deleteMany({});
            const RawStokesStokes = filteredData.map(item => new RawStokes(item));
            await RawStokes.insertMany(RawStokesStokes);
            const RawStokesRecords = await RawStokes.find({});
            res.json(RawStokesRecords);
        } catch (error) {
            res.json(error.message);
        }
        // res.json({ "x": x })
    }).catch((error) => { res.json(error); });
};

const insertIntradayStokes = async (req, res) => {
    const authorization = req.headers['authorization'];
    let config = parameters.intradayStokesParams(authorization);
    await axios(config).then(async (response) => {
        try {
            await Intraday.deleteMany({});
            const intradayStokes = response.data.data.map(item => {
                item.name = item.SymbolName;
                delete item.SymbolName;
                return new Intraday(item);
            });
            await Intraday.insertMany(intradayStokes);
            const insertedRecords = await Intraday.find({});
            res.json(insertedRecords);
        } catch (error) {
            res.json(error.message);
        }
    }).catch((error) => { res.json(error.message); });
}

const fetchIntradayStokes = async (req, res) => {
    try {
        const result = await Intraday.aggregate([
            {
                $lookup: {
                    from: 'rawstokes',
                    localField: 'name',
                    foreignField: 'name',
                    as: 'joinedData'
                }
            }, {
                $set: { updatedAt: new Date() }
            }, {
                $addFields: {
                    token: {
                        $arrayElemAt: [
                            '$joinedData.token', 0
                        ]
                    },
                    symbol: {
                        $arrayElemAt: [
                            '$joinedData.symbol', 0
                        ]
                    }
                }
            }, {
                $project: {
                    joinedData: 0
                }
            }
        ])
        await Intraday.deleteMany({});
        await Intraday.insertMany(result);
        const insertedRecord = await Intraday.find({});
        res.json(insertedRecord);
    } catch (error) {
        res.json(error.message);
    }
}

const fullyAutomateFetchIntradayStokes = async () => {
    const result = await Intraday.aggregate([
        {
            $lookup: {
                from: 'rawstokes',
                localField: 'name',
                foreignField: 'name',
                as: 'joinedData'
            }
        }, {
            $set: { updatedAt: new Date() }
        }, {
            $addFields: {
                token: {
                    $arrayElemAt: [
                        '$joinedData.token', 0
                    ]
                },
                symbol: {
                    $arrayElemAt: [
                        '$joinedData.symbol', 0
                    ]
                }
            }
        }, {
            $project: {
                joinedData: 0
            }
        }
    ])
    await Intraday.deleteMany({});
    await Intraday.insertMany(result);
    await Intraday.deleteMany({ token: undefined })
    return await Intraday.find({});
}

const fullyAutomateLoadStokes = async (req, res) => {
    const insertedRecords = await Intraday.find({});
    res.json(insertedRecords);
}

const rotateLTPRequests = async (config) => {
    await axios(config).then(async (response) => {
        try {
            const ltpData = response.data.data.fetched;
            console.log('LTP Data:', ltpData.length);
            console.log('LTP Data:', ltpData[0]);
            ltpData.forEach(async (ltpItem) => {
                await Intraday.findOneAndUpdate(
                    { token: ltpItem.symbolToken },
                    { $set: {  percentChange: ltpItem.percentChange }, $push: { ltp: ltpItem.ltp, open: ltpItem.open } },
                    { new: true, runValidators: false }
                );
            });

        } catch (error) {
            //res.json(error.message);
            console.error('Error merging LTP data:', error.message);
        }
    }).catch((error) => {
        console.log('error:', JSON.stringify(error));
        console.log('Config:', JSON.stringify(error.config));
        console.error('Error fetching LTP data:', error.message);
        //res.json(error.message);
    });
}

const fullyAutomateLoadStokesInterval = async () => {
    const intradayRecords = await Intraday.find({});
    let tokens = intradayRecords.map(item => item.token.toString());
    let loginDetailsObj = await AutoLogin.find({});
    const authorization = 'Bearer ' + loginDetailsObj[0].session.data.jwtToken;
    const result = tokens.reduce((resultArray, item, index) => {
        const chunkIndex = Math.floor(index / 50)
        if (!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = [] // start a new chunk
        }
        resultArray[chunkIndex].push(item)
        return resultArray
    }, [])
    console.log('Total Tokens:', result.length);
    result.forEach(async (item, index) => {
        let data = { "mode": "FULL", "exchangeTokens": { "NSE": item } }
        let config = parameters.intradayQuoatesParams(authorization, data);
        setTimeout(async () => { await rotateLTPRequests(config); }, index * 100);
    });
}

const fullyAutomateLTP = async (req, res) => {
    try {
        await fullyAutomateLoadStokesInterval();
        setInterval(async () => { await fullyAutomateLoadStokesInterval(); }, 15000);
        //await webSocketManyV2();
        res.json({ message: "LTP data fetched successfully" });
    } catch (error) {
        res.json(error.message);
    }
}


const webSocketManyV2 = async () => {
    let loginDetailsObj = await AutoLogin.find({});
    let web_socket = new WebSocketV2({
        clientcode: "V112910",
        jwttoken: 'Bearer ' + loginDetailsObj[0].session.data.jwtToken,
        apikey: 'jkFNrQQQ',
        feedtype: loginDetailsObj[0].session.data.feedToken,
    });
   // web_socket.
    //web_socket.close();
    web_socket.connect().then(async (res) => {
        console.log('WebSocket connected:', res);
        const intradayRecords = await Intraday.find({});
        const tokens = intradayRecords.map(item => { if (item.token) { return '---' + item.token; } }).join(',').replace(/---undefined,/g, '').replace(/---/g, '');
        console.log('Tokens to subscribe:', tokens);
        // Replace with your desired tokens
        // Subscribe to tokens
        let json_req = {
            action: 1,
            mode: 1,
            exchangeType: 1,
            tokens: tokens //['5449', '910', '14584', '10825'] // Example tokens
        };

        web_socket.fetchData(json_req);
        web_socket.on('tick', receiveTick);

        function receiveTick(data) {
            console.log('receiveTick:::::', data);
            //web_socket.close(); // Close the connection after receiving data
        }
    });
}

const webSocketManyOrderUpdates = async () => {
    let loginDetailsObj = await AutoLogin.find({});
    return new WSOrderUpdates({
        clientcode: "V112910",
        jwttoken: 'Bearer ' + loginDetailsObj[0].session.data.jwtToken,
        apikey: 'jkFNrQQQ',
        feedtype: loginDetailsObj[0].session.data.feedToken,
    });
}


module.exports = {
    insertRawStokes, insertIntradayStokes, fetchIntradayStokes, rawStokesFilter, fullyAutomateFetchIntradayStokes, fullyAutomateLoadStokes, fullyAutomateLTP
};