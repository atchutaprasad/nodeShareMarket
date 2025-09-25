var axios = require("axios");
const mongoose = require('mongoose');
const parameters = require('../parameters.js');
let RawStokes = require('../scema/rawStoke.model');
let Intraday = require('../scema/intradayStoke.model');


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
    return result;
}

const fullyAutomateLoadStokes = async (req, res) => {
    const insertedRecords = await Intraday.find({});
    res.json(insertedRecords);
}


module.exports = {
    insertRawStokes, insertIntradayStokes, fetchIntradayStokes, rawStokesFilter, fullyAutomateFetchIntradayStokes, fullyAutomateLoadStokes
};