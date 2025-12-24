var axios = require('../axiosInterceptor');
//const mongoose = require('mongoose');
const cronJob = require('node-cron');

//let { SmartAPI, WebSocket, WebSocketV2 } = require('smartapi-javascript');
const parameters = require('../parameters.js');
let RawStokes = require('../scema/rawStoke.model');
let { Intraday } = require('../scema/intradayStoke.model');
//let AutoLogin = require('../scema/loginDetails.model');
let UtilitySchema = require('../scema/utility.model');
//let loginLogoutController = require('./loginLogout.controller');
//const WSOrderUpdates = require('smartapi-javascript/src/websocket-order-updates');
let intervalStopper;


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
    let config = parameters.loadRawStokesParams();
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
    let config = parameters.intradayStokesParams();
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
                from: 'rawstokes',//+(new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })).split(',')[0],
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
    console.log('results - ', result.length);
    //console.log(result);
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
        //console.log('LTP response received with ', response);
        try {
            const ltpData = response.data.data.fetched;
            //console.log('LTP Data:', ltpData.length);
            //console.log('LTP Data:', ltpData[0]);
            ltpData.forEach(async (ltpItem) => {
                let updateObj = {};

                //wokring version

                // await Intraday.findOneAndUpdate(
                //     { token: ltpItem.symbolToken,'ltp.slice(-1)': { $ne: ltpItem.ltp } },
                //     { $set: { percentChange: ltpItem.percentChange }, $push:  { ltp: ltpItem.ltp, open: ltpItem.open, ltpTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) }},
                //     { new: true, runValidators: false }
                // );

                const stoke = await Intraday.findOne({ token: ltpItem.symbolToken });
                //console.log(stoke)
                if (stoke.ltp && stoke.ltp.length > 1 && stoke.ltp.at(-1) !== ltpItem.ltp) {
                    updateObj.ltp = ltpItem.ltp;
                    updateObj.ltpTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
                    updateObj.ltpPercentage = ((ltpItem.ltp - ltpItem.open) / ltpItem.open) * 100; //ltpItem.ltpPercentage;
                }
                if (stoke.open && stoke.open.length > 1 && stoke.open.at(-1) !== ltpItem.open) {
                    updateObj.open = ltpItem.open;
                    updateObj.openTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
                }


                if (stoke.ltp && stoke.ltp.length < 2) {
                    updateObj.ltp = ltpItem.ltp;
                    updateObj.ltpTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
                    updateObj.ltpPercentage = ((ltpItem.ltp - ltpItem.open) / ltpItem.open) * 100; //ltpItem.ltpPercentage;
                }
                if (stoke.open && stoke.open.length < 2) {
                    updateObj.open = ltpItem.open;
                    updateObj.openTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
                }
                //console.log(updateObj)

                await Intraday.findOneAndUpdate(
                    { token: ltpItem.symbolToken },
                    {
                        $set: { percentChange: ltpItem.percentChange }, $push: updateObj
                    },
                    { new: true, runValidators: false }
                );
            });

        } catch (error) {
            //res.json(error.message);
            console.error('Error merging LTP data:', error.message);
        }
    }).catch((error) => {
        if (error.isAxiosError) {
            // Optionally log a minimal message or skip logging
            console.error('Axios error occurred ------ ', config.data, error.response?.data);
            //return; // Do nothing, suppress log
        }
        // Log other errors if needed
        //console.error(error);

        //console.log('response failed data:', JSON.stringify(error.response.data));
        //console.log('response failed data 2:', config.data);
        //console.log('error:', JSON.stringify(error));
        //console.log('Config:', JSON.stringify(error.config));
        //console.error('Error fetching LTP data:', error.message);
        //res.json(error.message);
    });
}

const fullyAutomateLoadStokesInterval = async () => {
    const intradayRecords = await Intraday.find({});
    let tokens = intradayRecords.map(item => item.token.toString());
    const result = tokens.reduce((resultArray, item, index) => {
        const chunkIndex = Math.floor(index / 50)
        if (!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = [] // start a new chunk
        }
        resultArray[chunkIndex].push(item)
        return resultArray
    }, [])
    //console.log('Total Tokens:', result.length);
    result.forEach(async (item, index) => {
        let data = { "mode": "FULL", "exchangeTokens": { "NSE": item } }
        let config = parameters.intradayQuoatesParams(data);
        setTimeout(async () => { await rotateLTPRequests(config); }, index * 100);
    });

}

const fullyAutomateLTP = async (req, res) => {
    try {
        await fullyAutomateLoadStokesInterval();
        await UtilitySchema.deleteMany({});
        const utilityltp = new UtilitySchema({ ltpStatus: true });
        await utilityltp.save();
        intervalStopper = setInterval(async () => {
            let utilitySchemaDetailsObj = await UtilitySchema.find({});
            //console.log(utilitySchemaDetailsObj);
            if (utilitySchemaDetailsObj[0].ltpStatus == true) {
                await fullyAutomateLoadStokesInterval();
                console.log('interval running at ', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
            } else {
                clearInterval(intervalStopper);
                console.log('interval cleared at ', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
            }
        }, 15000);
        //await webSocketManyV2();
        res.json({ message: "LTP data fetched successfully" });
    } catch (error) {
        res.json(error.message);
    }
}

const stopFullyAutomateLTP = async (req, res) => {
    try {
        await UtilitySchema.deleteMany({});
        const utilityltp = new UtilitySchema({ ltpStatus: false });
        await utilityltp.save();
        res.json({ message: "stop  ----  LTP data fetched successfully" });
    } catch (error) {
        res.json(error.message);
    }
}


//minute hour day month weekDay //45 8 * * 1-5 // 
cronJob.schedule('5 9 * * 1-5', () => {
    let req = {};
    let res = { status: () => { return { json: () => { } } }, json: () => { } };
    fullyAutomateLTP(req, res);
    console.log("Cron Job Started at intraday stats", new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
}, {
    timezone: 'Asia/Kolkata'
});

cronJob.schedule('25 9 * * 1-5', () => {
    let req = {};
    let res = { status: () => { return { json: () => { } } }, json: () => { } };
    stopFullyAutomateLTP(req, res);
    console.log("Cron Job stopped at intraday stats", new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
}, {
    timezone: 'Asia/Kolkata'
});



module.exports = {
    insertRawStokes,
    insertIntradayStokes,
    fetchIntradayStokes,
    rawStokesFilter,
    fullyAutomateFetchIntradayStokes,
    fullyAutomateLoadStokes,
    fullyAutomateLTP,
    stopFullyAutomateLTP,
    fullyAutomateLoadStokesInterval,
};