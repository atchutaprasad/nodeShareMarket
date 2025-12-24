var axios = require('../axiosInterceptor');
const cronJob = require('node-cron');
const parameters = require('../parameters.js');
let { Intraday, LuckyIntraday } = require('../scema/intradayStoke.model');
let intradayController = require('./intraday.controller');
const { json } = require('body-parser');




const getHistory = async (req, res) => {
    try {
        await intradayController.fullyAutomateLoadStokesInterval();
        const fromDate = req?.query?.fromDate || req?.body?.fromDate;
        const toDate = req?.query?.toDate || req?.body?.toDate;
        let fromDateString = '';
        let toDateString = '';
        if (!fromDate && !toDate) {
            fromDateString = getLastWorkingDay();
            toDateString = getLastWorkingDay();;
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
                    await LuckyIntraday.deleteOne({ token: item.token });
                }
               // console.log('identifyLuckyRecord found - ', item);
                if (validItemToLuckyRecord === true) {
                    identifyLuckyRecord = new LuckyIntraday({
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
                    await identifyLuckyRecord.save();
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


const calculateIntradayStats = async () => {
    try {
        const intradayRecords = await Intraday.find({});



        const stoke = await Intraday.findOne({ token: ltpItem.symbolToken });


        for (const item of intradayRecords) {
            if (item.history && item.history.length > 0) {

                var historyd = [];
                item.history.forEach(async (candle, index, array) => {
                    if ((index === array.length - 1) && candle && candle.length >= 5) {
                        const open = candle[1];
                        const close = candle[4];
                        if (open && close) {
                            const change = ((close - open) / open) * 100;
                            historyd.push(change.toFixed(2));
                        }
                    }
                });
                //const averageChange = validDays > 0 ? (totalChange / validDays).toFixed(2) : 0;
                await Intraday.findOneAndUpdate(
                    { token: item.token },
                    { $set: { history: historyd } },
                    { new: true, runValidators: false }
                );
                //console.log(`Updated average daily change for ${item.name} (${item.token}): ${averageChange}%`);
            } else {
                console.log(`No history data for ${item.name} (${item.token}) to calculate stats.`);
            }
        }
    } catch (error) {
        console.error('Error calculating intraday stats:', error.message || error);
    }
};

const getLastWorkingDay = () => {
    let date = new Date();
    // Create a new date object to avoid modifying the original date parameter
    let workday = new Date(date.getTime());
    let dayOfWeek = workday.getDay();

    let daysToSubtract = 1; // Start by checking yesterday

    // If today is Sunday (0), subtract 2 days to get Friday
    if (dayOfWeek === 0) {
        daysToSubtract = 2;
    }
    // If today is Monday (1), subtract 3 days to get last Friday
    else if (dayOfWeek === 1) {
        daysToSubtract = 3;
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
}


//minute hour day month weekDay //40 8 * * 1-5
cronJob.schedule('40 8 * * 1-5', () => {
    let req = {};
    let res = { status: () => { return { json: () => { } } }, json: () => { } };
    getHistory(req, res);
    console.log("Cron Job Started at Lucky controller ", new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
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