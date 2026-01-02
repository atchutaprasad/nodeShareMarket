var axios = require('../axiosInterceptor');
//const mongoose = require('mongoose');
const cronJob = require('node-cron');

//let { SmartAPI, WebSocket, WebSocketV2 } = require('smartapi-javascript');
const parameters = require('../parameters.js');
let RawStokes = require('../scema/rawStoke.model');
let { Intraday, LuckyIntraday } = require('../scema/intradayStoke.model');
//let AutoLogin = require('../scema/loginDetails.model');
let UtilitySchema = require('../scema/utility.model');
let luckyController = require('./lucky.controller');
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

const fullyAutomateSelectedStokes = async (req, res) => {
    const insertedRecords = await LuckyIntraday.find({});
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

                let updateDBRecords = false;
                let ltpbasePrice = stoke.ltp[0] || 0// ltpItem.open > 0 ? ltpItem.open : (stoke.open && stoke.open.length > 0 ? stoke.open[0] : 0);
                let ltpPercentage = stoke.ltp[0] ? ((ltpItem.ltp - ltpbasePrice) / ltpbasePrice) * 100 : 0;

                let dateString = new Date();
                //console.log(`${dateString.getHours()}:${dateString.getMinutes()}:${dateString.getSeconds()}`)
                if (stoke.ltp && stoke.ltp.length < 2) {
                    updateObj.ltp = ltpItem.ltp;
                    updateObj.ltpTime = `${dateString.getHours()}:${dateString.getMinutes()}:${dateString.getSeconds()}`; //new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
                    updateObj.ltpPercentage = ltpPercentage.toFixed(2); //ltpItem.ltpPercentage;
                    updateDBRecords = true;
                }
                if (stoke.open && stoke.open.length < 2) {
                    updateObj.open = ltpItem.open;
                    updateObj.openTime = `${dateString.getHours()}:${dateString.getMinutes()}:${dateString.getSeconds()}`;
                    updateDBRecords = true;
                }


                if (stoke.ltp && stoke.ltp.length > 1 && stoke.ltp.at(-1) !== ltpItem.ltp) {
                    updateObj.ltp = ltpItem.ltp;
                    updateObj.ltpTime = `${dateString.getHours()}:${dateString.getMinutes()}:${dateString.getSeconds()}`;
                    updateObj.ltpPercentage = ltpPercentage.toFixed(2); //ltpItem.ltpPercentage;
                    updateDBRecords = true;
                }
                if (stoke.open && stoke.open.length > 1 && stoke.open.at(-1) !== ltpItem.open) {
                    updateObj.open = ltpItem.open;
                    updateObj.openTime = `${dateString.getHours()}:${dateString.getMinutes()}:${dateString.getSeconds()}`;
                    updateDBRecords = true;
                }

                if (updateDBRecords === true) {
                    //console.log('Updating stoke ', ltpItem.symbolToken, ' with LTP ', ltpItem.ltp, ' and Open ', ltpItem.open);
                    await Intraday.findOneAndUpdate(
                        { token: ltpItem.symbolToken },
                        {
                            $set: { percentChange: ltpItem.percentChange }, $push: updateObj
                        },
                        { new: true, runValidators: false }
                    );
                    let stokeName = ltpItem.tradingSymbol ? ltpItem.tradingSymbol.toLowerCase() : '';
                    //console.log('Stoke Name Check:', stokeName);
                    if (ltpItem.tradingSymbol && stokeName.length > 0 && !stokeName.includes('gold') && !stokeName.includes('silver') && !stokeName.includes('bank') && !stokeName.includes('nifty') && !stokeName.includes('sensex') && !stokeName.includes('mini') && !stokeName.includes('etf') && !stokeName.includes('index') && !stokeName.includes('ultra') && !stokeName.includes('bees') && !stokeName.includes('silv') && ltpItem.ltp < 1200) {
                        //console.log('Processing Lucky Intraday Stoke for ', ltpItem.symbolToken);
                        const LuckyIntradayStoke = await LuckyIntraday.findOne({ token: ltpItem.symbolToken });
                        if (LuckyIntradayStoke) {
                            await LuckyIntraday.findOneAndUpdate(
                                { token: ltpItem.symbolToken },
                                {
                                    $set: { percentChange: ltpItem.percentChange }, $push: updateObj
                                },
                                { new: true, runValidators: false }
                            );
                        } else if ((ltpPercentage >= 2 || ltpPercentage <= -2) && (ltpItem.open > 0 && ltpItem.ltp > 0)) { // adding new stoke if percent change is more than 2%
                            //console.log('Adding new lucky stoke with percent change of ', ltpPercentage.toFixed(2), '% for token ', ltpItem.symbolToken);
                            let stokeLTP = stoke.ltp ? [...stoke.ltp] : [];
                            let stokeOpen = stoke.open ? [...stoke.open] : [];
                            let stokeLtpTime = stoke.ltpTime ? [...stoke.ltpTime] : [];
                            let stokeOpenTime = stoke.openTime ? [...stoke.openTime] : [];
                            let stokeLTPPercentage = stoke.ltpPercentage ? [...stoke.ltpPercentage] : [];

                            if (updateObj.ltpPercentage) { stokeLTPPercentage.push(updateObj.ltpPercentage); }
                            if (updateObj.ltp) { stokeLTP.push(updateObj.ltp); }
                            if (updateObj.open) { stokeOpen.push(updateObj.open);  }
                            if (updateObj.ltpTime) { stokeLtpTime.push(updateObj.ltpTime);  }
                            if (updateObj.openTime) { stokeOpenTime.push(updateObj.openTime); }

                            //console.log('stoke ', stokeLTP, stokeLTPPercentage, stokeOpen, stokeLtpTime, stokeOpenTime);
                            // delete stoke._id;
                            const newLuckyIntradayStoke = new LuckyIntraday({
                                //...stoke,
                                ltp: stokeLTP,
                                ltpTime: stokeLtpTime,
                                openTime: stokeOpenTime,
                                open: stokeOpen,
                                ltpPercentage: stokeLTPPercentage,
                                Exchange: stoke.Exchange,
                                name: stoke.name,
                                Multiplier: stoke.Multiplier,
                                token: stoke.token,
                                symbol: stoke.symbol,
                                volume: stoke.volume,
                                high: stoke.high,
                                low: stoke.low,
                                close: stoke.close,
                                percentChange: stoke.percentChange,
                                buyPrice: stoke.buyPrice,
                                sellPrice: stoke.sellPrice,
                                orderId: stoke.orderId,
                                history: stoke.history,
                            });
                            await newLuckyIntradayStoke.save();
                            luckyController.placeLuckyBuyOrder(stoke.token);
                        }
                    }

                }

                //console.log(updateObj)





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
        // let dateNow = new Date();
        // const time913AM = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate(), 9, 13, 0, 0); // Year, Month (0-indexed), Day, Hour (9 for AM), Minute, Second, Millisecond
        // const time330PM = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate(), 15, 30, 0, 0); // Year, Month (0-indexed), Day, Hour (15 for PM), Minute, Second, Millisecond
        // if (dateNow.getTime() >= time913AM.getTime() && dateNow.getTime() <= time330PM.getTime()) {
        await fullyAutomateLoadStokesInterval();


        let utilitySchemaIdenity = await UtilitySchema.findOne({ utilitySchemaIdentifier: true });
        if (utilitySchemaIdenity) {
            await UtilitySchema.findOneAndUpdate(
                { utilitySchemaIdentifier: true },
                {
                    $set: { ltpStatus: true }, // Clear existing history
                },
                { new: true, runValidators: false }
            );
        } else {
            const utilitySchema = new UtilitySchema({ utilitySchemaIdentifier: true, ltpStatus: true, luckyLtpStatus: true });
            await utilitySchema.save();
        }

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

        res.json({ message: "Market is Open now. LTP fetching will start at 9:15 AM IST" });
        // } else {
        //     await fullyAutomateLoadStokesInterval();
        //     res.json({ message: "Market is Closed now. LTP fetching will close at 3:30 PM IST" });
        // }

        //await webSocketManyV2();
        //res.json({ message: "LTP data fetched successfully" });
    } catch (error) {
        res.json(error.message);
    }
}

const stopFullyAutomateLTP = async (req, res) => {
    try {
        // await UtilitySchema.deleteMany({});
        // const utilityltp = new UtilitySchema({ ltpStatus: false });
        // await utilityltp.save();

        let utilitySchemaIdenity = await UtilitySchema.findOne({ ltpStatus: true });
        if (utilitySchemaIdenity) {
            await UtilitySchema.findOneAndUpdate(
                { ltpStatus: true },
                {
                    $set: { ltpStatus: false }, // Clear existing history
                },
                { new: true, runValidators: false }
            );
        }


        res.json({ message: "stop  ----  LTP data fetched successfully" });
    } catch (error) {
        res.json(error.message);
    }
}


//minute hour day month weekDay //45 8 * * 1-5 // 
cronJob.schedule('15 9 * * 1-5', () => {
    let req = {};
    let res = { status: () => { return { json: () => { } } }, json: () => { } };
    fullyAutomateLTP(req, res);
    console.log("Cron Job Started at 9:15 AM", new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
}, {
    timezone: 'Asia/Kolkata'
});

cronJob.schedule('17 9 * * 1-5', () => {
    let req = {};
    let res = { status: () => { return { json: () => { } } }, json: () => { } };
    stopFullyAutomateLTP(req, res);
    console.log("Cron Job stopped at 9:17AM", new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
}, {
    timezone: 'Asia/Kolkata'
});

// cronJob.schedule('35 15 * * 1-5', () => {
//     let req = {};
//     let res = { status: () => { return { json: () => { } } }, json: () => { } };
//     stopFullyAutomateLTP(req, res);
//     console.log("Cron Job stopped at 3:35 PM", new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
// }, {
//     timezone: 'Asia/Kolkata'
// });



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
    fullyAutomateSelectedStokes,
};