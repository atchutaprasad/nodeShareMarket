var axios = require('../axiosInterceptor');
const cronJob = require('node-cron');
const parameters = require('../parameters.js');
let { Intraday, LuckyIntraday } = require('../scema/intradayStoke.model');
//let intradayController = require('./intraday.controller');
const { json } = require('body-parser');

let intervalLuckyStopper;


const getHistory = async (req, res) => {
    try {
        //await intradayController.fullyAutomateLoadStokesInterval();
        const fromDate = req?.query?.fromDate || req?.body?.fromDate;
        const toDate = req?.query?.toDate || req?.body?.toDate;
        let fromDateString = '';
        let toDateString = '';
        if (!fromDate && !toDate) {
            fromDateString = getWorkingDay(21);
            toDateString = getWorkingDay(1);
        } else {
            fromDateString = fromDate.trim();
            toDateString = toDate.trim();
        }
        console.log('Fetching history for date:', fromDateString, ' to ', toDateString);
        //dateString = dateString.trim();
        // Use AutoLogin to fetch saved jwt token



        const intradayRecords = await Intraday.find({});
        //let tokens = intradayRecords.map(item => item.token.toString());
        console.log('Intraday Records Count:', intradayRecords.length);
        // console.log('Intraday Records Count:', intradayRecords[0]);
        //let rd = intradayRecords.slice(1, 4); // Create a shallow copy of the array
        intradayRecords.forEach(async (item, index, array) => {
            setTimeout(async () => {
                let validItemToLuckyRecord = false;
                const requestBody = {
                    "exchange": "NSE",
                    "symboltoken": item.token.toString(),
                    "interval": "ONE_DAY",
                    "fromdate": `${fromDateString} 00:00`,
                    "todate": `${toDateString} 23:59`
                };
                const config = parameters.getCandleDataParams(requestBody);
                const response = await axios(config).catch((error) => {
                    if (error.isAxiosError) {
                        // Optionally log a minimal message or skip logging
                        console.error('Axios error occurred ------ ', item.name, error.response?.data);
                        return; // Do nothing, suppress log
                    }
                    // Log other errors if needed
                    console.error(error);
                });
                let historyd = [];
                if (response?.data?.data && response?.data?.data.length > 0) {
                    // historyd = response?.data?.data; //response?.data?.data[0][1] ? (((response?.data?.data[0][4]) - (response?.data?.data[0][1])).toFixed(2)) : 'No Data-';
                    let historyPercentChanges = [];
                    response?.data?.data.forEach(async (candle, candleIndex, candleArray) => {
                        //(candleIndex === candleArray.length - 1) && 
                        if (candle && candle.length >= 5) {
                            const open = candle[1];
                            const close = candle[4];
                            if (open && close) {
                                const change = ((close - open) / open) * 100;
                                // historyd.push(change.toFixed(2));
                                historyPercentChanges.push(change.toFixed(2));

                                if ((candleIndex === candleArray.length - 1) && (change > 10 || change < -10)) {
                                    console.log(`Latest Daily change for ${item.name} (${item.token}) on ${candle[0]}: ${change.toFixed(2)}%`);
                                    validItemToLuckyRecord = true;
                                }
                            }
                        }
                    });

                    historyd.push(historyPercentChanges.join(', '));
                    let isIncreasing = true;
                    let isDecreasing = true;


                    for (let i = 1; i < response?.data?.data.length; i++) {
                        if (response?.data?.data[i][5] > response?.data?.data[i - 1][5]) {
                            isDecreasing = false;
                        } else if (response?.data?.data[i][5] < response?.data?.data[i - 1][5]) {
                            isIncreasing = false;
                        }
                    }
                    if (isIncreasing) {
                        //  console.log('Overall Trend Increasing for token', item.name, response?.data?.data);
                        historyd.push('Increasing');
                        // validItemToLuckyRecord = true;

                    } else if (isDecreasing) {
                        //   console.log('Overall Trend Decreasing for token', item.name, response?.data?.data);
                        historyd.push('Decreasing');
                        // validItemToLuckyRecord = true;
                    } else {
                        historyd.push('Mixed');
                    }

                    historyd.push(response?.data?.data);

                } else {
                    historyd.push('History - No Data');
                    historyd.push('Volume - No Data');
                    console.log('No Candle Data Request for token', item.name, ':', response?.data?.data);
                }

                await Intraday.findOneAndUpdate(
                    { token: item.token },
                    {
                        $set: { history: historyd }, // Clear existing history
                    },
                    { new: true, runValidators: false }
                );

                let identifyLuckyRecord = await LuckyIntraday.findOne({ token: item.token });
                if (identifyLuckyRecord) {
                    //await LuckyIntraday.deleteOne({ token: item.token });
                    await LuckyIntraday.findOneAndUpdate(
                        { token: item.token },
                        {
                            $set: { history: historyd }, // Clear existing history
                        },
                        { new: true, runValidators: false }
                    );

                } else if (validItemToLuckyRecord === true) {
                    const newLuckyIntradayStoke = new LuckyIntraday({
                        Exchange: item.Exchange,
                        name: item.name,
                        Multiplier: item.Multiplier,
                        token: item.token,
                        symbol: item.symbol,
                        volume: item.volume,
                        ltp: item.ltp,
                        ltpTime: item.ltpTime,
                        openTime: item.openTime,
                        open: item.open,
                        high: item.high,
                        low: item.low,
                        close: item.close,
                        percentChange: item.percentChange,
                        buyPrice: item.buyPrice,
                        sellPrice: item.sellPrice,
                        orderId: item.orderId,
                        history: historyd
                    });
                    await newLuckyIntradayStoke.save();
                }



                if (index === array.length - 1) {
                    console.log(`Completed fetching history for all tokens.`);
                    //calculateIntradayStats();
                }

                //await sleep(1000); // 1 second delay between requests
            }, index * 400); // 3 requests per second
        });

        const intradayResults = await Intraday.find({});
        res.json(intradayResults);


    } catch (error) {
        //console.error('Error fetching history:', error.message || error);

        res.json({ status: false, message: error.message || JSON.stringify(error) });


    }
}

const getWorkingDay = (dayCount) => {
    let date = new Date();
    // Create a new date object to avoid modifying the original date parameter
    let workday = new Date(date.getTime());
    let dayOfWeek = workday.getDay();

    let daysToSubtract = dayCount || 1; // Start by checking yesterday

    if (dayCount && typeof dayCount === 'number' && dayCount === 1) {
        // If today is Sunday (0), subtract 2 days to get Friday
        if (dayOfWeek === 0) {
            daysToSubtract = 2;
        }
        // If today is Monday (1), subtract 3 days to get last Friday
        else if (dayOfWeek === 1) {
            daysToSubtract = 3;
        }
    }




    // Subtract the calculated number of days. The setDate method automatically
    // handles month and year transitions.
    workday.setDate(workday.getDate() - daysToSubtract);

    // If the resulting day is still a weekend (e.g., if there are holidays involved, though this
    // simple function doesn't account for them), this loop ensures it finds a weekday.
    while (workday.getDay() === 0 || workday.getDay() === 6) {
        workday.setDate(workday.getDate() - 1);
    }

    const yyyy = workday.getFullYear();
    const mm = String(workday.getMonth() + 1).padStart(2, '0');
    const dd = String(workday.getDate()).padStart(2, '0');


    return `${yyyy}-${mm}-${dd}`;
};

const rotateLuckyLTPRequests = async (config) => {
    try {
        const response = await axios(config).catch((error) => {
            if (error.isAxiosError) {
                console.error('Axios error occurred in rotateLuckyLTPRequests:', error.response?.data);
                return;
            }
            // Log other errors if needed
            console.error(error);
        });

        // if (response?.data?.data) {
        //     // Process each token's LTP data
        //     for (const [token, ltpData] of Object.entries(response.data.data)) {
        //         try {
        //             const luckyRecord = await LuckyIntraday.findOne({ token: token });

        //             if (luckyRecord && ltpData.ltp) {
        //                 const currentLTP = ltpData.ltp;
        //                 const openPrice = luckyRecord.open || ltpData.open;

        //                 // Calculate percentage increase
        //                 let percentageIncrease = 0;
        //                 if (openPrice && openPrice > 0) {
        //                     percentageIncrease = (((currentLTP - openPrice) / openPrice) * 100).toFixed(2);
        //                 }

        //                 // Update the record with new LTP and percentage
        //                 await LuckyIntraday.findOneAndUpdate(
        //                     { token: token },
        //                     {
        //                         $set: { 
        //                             ltp: currentLTP,
        //                             ltpPercentage: percentageIncrease,
        //                             ltpTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        //                         }
        //                     },
        //                     { new: true, runValidators: false }
        //                 );

        //                 console.log(`Updated LTP for token ${token}: LTP=${currentLTP}, Percentage Change=${percentageIncrease}%`);
        //             }
        //         } catch (updateError) {
        //             console.error(`Error updating LTP for token ${token}:`, updateError.message);
        //         }
        //     }
        // }

        console.log('rotateLuckyLTPRequests LTP Response:', response?.data);
    } catch (error) {
        console.error('Error in rotateLuckyLTPRequests:', error.message || error);
    }
};

var nineSeventeenTask = async (req, res) => {
    try {
        await nineSeventeenTaskInterval();

        let utilitySchemaIdenity = await UtilitySchema.findOne({ utilitySchemaIdentifier: true });
        if (utilitySchemaIdenity) {
            await UtilitySchema.findOneAndUpdate(
                { utilitySchemaIdentifier: true },
                {
                    $set: { luckyLtpStatus: true }, // Clear existing history
                },
                { new: true, runValidators: false }
            );
        } else {
            const utilitySchema = new UtilitySchema({ utilitySchemaIdentifier: true, ltpStatus: false, luckyLtpStatus: true });
            await utilitySchema.save();
        }

        intervalLuckyStopper = setInterval(async () => {
            let utilitySchemaDetailsObj = await UtilitySchema.find({});
            //console.log(utilitySchemaDetailsObj);
            if (utilitySchemaDetailsObj[0].luckyLtpStatus == true) {
                await nineSeventeenTaskInterval();
                console.log('interval of Lucky running at ', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
            } else {
                clearInterval(intervalLuckyStopper);
                console.log('interval of Lucky cleared at ', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
            }
        }, 15000);

        res.json({ message: "Market is Open now. NineSeventeenTask LTP fetching will start at 9:17 AM IST" });


        //res.json({ message: "NineSeventeenTask data fetched successfully" });
    } catch (error) {
        res.json(error.message);
    }

    // console.log("9:17 AM Task Started at Lucky controller ", new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
};

var nineSeventeenTaskInterval = async () => {
    try {
        const luckyIntradayRecords = await LuckyIntraday.find({});
        let tokens = luckyIntradayRecords.map(item => item.token.toString());
        const result = tokens.reduce((resultArray, item, index) => {
            const chunkIndex = Math.floor(index / 30) // 20 items per chunk
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
            setTimeout(async () => { await rotateLuckyLTPRequests(config); }, index * 100);
        });
    } catch (error) {
        console.error(error.message);
    }

    // console.log("9:17 AM Task Started at Lucky controller ", new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
};

const stopFullyAutomateLuckyLTP = async (req, res) => {
    try {
        // await UtilitySchema.deleteMany({});
        // const utilityltp = new UtilitySchema({ ltpStatus: false });
        // await utilityltp.save();

        let utilitySchemaIdenity = await UtilitySchema.findOne({ luckyLtpStatus: true });
        if (utilitySchemaIdenity) {
            await UtilitySchema.findOneAndUpdate(
                { utilitySchemaIdentifier: true },
                {
                    $set: { luckyLtpStatus: false }, // Clear existing history
                },
                { new: true, runValidators: false }
            );
        }


        res.json({ message: "stop  ----  LTP data fetched successfully" });
    } catch (error) {
        res.json(error.message);
    }
};


//minute hour day month weekDay //40 8 * * 1-5
cronJob.schedule('40 8 * * 1-5', () => {
    let req = {};
    let res = { status: () => { return { json: () => { } } }, json: () => { } };
    getHistory(req, res);
    console.log("Cron Job Started for getHistory", new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
}, {
    timezone: 'Asia/Kolkata'
});


cronJob.schedule('17 9 * * 1-5', () => {
    let req = {};
    let res = { status: () => { return { json: () => { } } }, json: () => { } };
    nineSeventeenTask(req, res);
    console.log("Cron Job started at 9:17AM for nineSeventeenTask", new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
}, {
    timezone: 'Asia/Kolkata'
});



cronJob.schedule('15 11 * * 1-5', async () => {
    let req = {};
    let res = { status: () => { return { json: () => { } } }, json: () => { } };
    stopFullyAutomateLuckyLTP(req, res);
    console.log("Cron Job stopped at 11:15AM", new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
}, {
    timezone: 'Asia/Kolkata'
});


module.exports = {
    getHistory
};



// if (candle && candle.length >= 5) {
//     const open = candle[1];
//     const close = candle[4];
//     if (open && close) {
//         const change = ((close - open) / open) * 100;
//         console.log(`Daily change for ${item.name} (${item.token}) on ${candle[0]}: ${change.toFixed(2)}%`);
//         // candle.push(change.toFixed(2)); // Append daily change to candle data
//         totalChange += change;
//         validDays++;
//     }
// }

// historyd.push({
//                                 date: candle[0],
//                                 open: open,
//                                 high: candle[2],
//                                 low: candle[3],
//                                 close: close,
//                                 volume: candle[5],
//                                 dailyChange: change.toFixed(2)
//                             });

// const requestBody = {
//     "exchange": "NSE",
//     "symboltoken": "99926000",
//     "interval": "ONE_HOUR",
//     "fromdate": "2023-09-06 11:15",
//     "todate": "2023-09-06 12:00"
// }

// $push: {
//                                 history: {
//                                     date: dateString,
//                                     open: response?.data?.data[0][1],
//                                     high: response?.data?.data[0][2],
//                                     low: response?.data?.data[0][3],
//                                     close: response?.data?.data[0][4],
//                                     volume: response?.data?.data[0][5]
//                                 }
//                             }


// const calculateIntradayStats = async () => {
//     try {
//         const intradayRecords = await Intraday.find({});



//         const stoke = await Intraday.findOne({ token: ltpItem.symbolToken });


//         for (const item of intradayRecords) {
//             if (item.history && item.history.length > 0) {

//                 var historyd = [];
//                 item.history.forEach(async (candle, index, array) => {
//                     if ((index === array.length - 1) && candle && candle.length >= 5) {
//                         const open = candle[1];
//                         const close = candle[4];
//                         if (open && close) {
//                             const change = ((close - open) / open) * 100;
//                             historyd.push(change.toFixed(2));
//                         }
//                     }
//                 });
//                 //const averageChange = validDays > 0 ? (totalChange / validDays).toFixed(2) : 0;
//                 await Intraday.findOneAndUpdate(
//                     { token: item.token },
//                     { $set: { history: historyd } },
//                     { new: true, runValidators: false }
//                 );
//                 //console.log(`Updated average daily change for ${item.name} (${item.token}): ${averageChange}%`);
//             } else {
//                 console.log(`No history data for ${item.name} (${item.token}) to calculate stats.`);
//             }
//         }
//     } catch (error) {
//         console.error('Error calculating intraday stats:', error.message || error);
//     }
// };


//console.log('Fetching history for token:', item);

//console.log('Candle Data Response for token', item.token, ':', response);



// intradayRecords.forEach(async (item, index) => {
//     setTimeout(async () => {

//         const requestBody = {
//             exchange: 'NSE',
//             symboltoken: item.token.toString(),
//             interval: 'DAY',
//             fromdate: `${dateString} 00:00`,
//             todate: `${dateString} 23:59`
//         };

//         const config = parameters.getCandleDataParams(authorization, requestBody);
//         const response = await axios(config).catch((error) => {
//             if (error.isAxiosError) {
//                 // Optionally log a minimal message or skip logging
//                  console.error('Axios error occurred:', error);
//                 return; // Do nothing, suppress log
//             }
//             // Log other errors if needed
//             console.error(error);
//         });
//         console.log('Candle Data Request for token', item.token, ':', response);
//         // await Intraday.findOneAndUpdate(
//         //     { token: item.token },
//         //     {
//         //         $push: {
//         //             history: {
//         //                 date: dateString,
//         //                 open: response.data.candles[0][1],
//         //                 high: response.data.candles[0][2],
//         //                 low: response.data.candles[0][3],
//         //                 close: response.data.candles[0][4],
//         //                 volume: response.data.candles[0][5]
//         //             }
//         //         }
//         //     },
//         //     { new: true, runValidators: false }
//         // );

//     }, index * 1000);

//     //console.log('Fetching history for token:', item);

//     //console.log('Candle Data Response for token', item.token, ':', response.data);

// });

// const updateObj = {
//     history: {
//         date: dateString,
//         open: null,
//         high: null,
//         low: null,
//         close: null,
//         volume: null
//     }
// };
// Build request body for SmartAPI getCandleData






// return the raw response data (status and data)
// res.json({ status: true, message: 'History fetch initiated for intraday stocks. Check logs for details.' });


/**
 * 
 * function calculateEMA(closingPrices, period) {
    const k = 2 / (period + 1);
    // The first EMA is typically the SMA of the first 'period' closing prices
    let ema = closingPrices.slice(0, period).reduce((acc, price) => acc + price, 0) / period;

    // Start iterating from the (period)-th element
    for (let i = period; i < closingPrices.length; i++) {
        ema = (closingPrices[i] * k) + (ema * (1 - k));
    }
    return ema;
}

// Example usage (replace with data fetched from SmartAPI)
const closingPrices = [100, 101, 102, 105, 103, 106, 108, 107, 109, 110, 112, 115, 114, 116];
const ema14 = calculateEMA(closingPrices, 14);
console.log(ema14);


function calculateRSI(closingPrices, period = 14) {
    let gains = [];
    let losses = [];

    // Calculate initial gains and losses
    for (let i = 1; i < closingPrices.length; i++) {
        const difference = closingPrices[i] - closingPrices[i - 1];
        gains.push(Math.max(0, difference));
        losses.push(Math.max(0, -difference));
    }

    // Calculate initial average gain and average loss (SMA for the first 'period' values)
    let avgGain = gains.slice(0, period).reduce((acc, val) => acc + val, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((acc, val) => acc + val, 0) / period;

    // Calculate subsequent averages and RSI
    for (let i = period; i < gains.length; i++) {
        // Smoothed average calculation
        avgGain = ((avgGain * (period - 1)) + gains[i]) / period;
        avgLoss = ((avgLoss * (period - 1)) + losses[i]) / period;
    }

    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    return rsi;
}

// Example usage (replace with data fetched from SmartAPI)
const pricesForRSI = [100, 101, 102, 105, 103, 106, 108, 107, 109, 110, 112, 115, 114, 116, 118];
const rsi14 = calculateRSI(pricesForRSI, 14);
console.log(rsi14);

 */