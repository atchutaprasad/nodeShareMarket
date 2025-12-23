var axios = require('../axiosInterceptor');
const mongoose = require('mongoose');
let AutoLogin = require('../scema/loginDetails.model');
const parameters = require('../parameters.js');
let { Intraday } = require('../scema/intradayStoke.model');
let intradayController = require('./intraday.controller');


const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const getHistory = async (req, res) => {
    try {
        await intradayController.fullyAutomateLoadStokesInterval();
        const fromDate = req.query?.fromDate || req.body?.fromDate;
        const toDate = req.query?.toDate || req.body?.toDate;
        let fromDateString = '';
        let toDateString = '';
        if (!fromDate && !toDate) {
            let d;
            d = new Date();
            d.setDate(d.getDate() - 1); // Get data from 1 days ago
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            fromDateString = `${yyyy}-${mm}-${dd}`;
            toDateString = `${yyyy}-${mm}-${dd}`;
        } else {
            console.log('Date received for history fetch: ' + fromDate);
            fromDateString = fromDate.trim();
            toDateString = toDate.trim();
        }
        console.log('Fetching history for date:', fromDateString, ' to ', toDateString);
        //dateString = dateString.trim();
        // Use AutoLogin to fetch saved jwt token
        


        const intradayRecords = await Intraday.find({});
        //let tokens = intradayRecords.map(item => item.token.toString());
        console.log('Intraday Records Count:', intradayRecords.length);
        //let rd = intradayRecords.slice(1, 4); // Create a shallow copy of the array
        intradayRecords.forEach(async (item, index, array) => {
            setTimeout(async () => {
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
                        historyd.push('Volume: Increasing');
                    } else if (isDecreasing) {
                     //   console.log('Overall Trend Decreasing for token', item.name, response?.data?.data);
                        historyd.push('Volume: Decreasing');
                    } else {
                        historyd.push('Volume: Mixed');
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

                if (index === array.length - 1) {
                    console.log(`Completed fetching history for all tokens.`);
                    //calculateIntradayStats();
                }

                //await sleep(1000); // 1 second delay between requests
            }, index * 500); // 3 requests per second
        });

        const intradayResults = await Intraday.find({});
        console.log('intradayResults - ' + intradayResults.length)
        res.json(intradayResults);
        //res.json({ status: true, data: [] });


    } catch (error) {
        //console.error('Error fetching history:', error.message || error);
        res.status(500).json({ status: false, message: error.message || JSON.stringify(error) });
    }
}

const calculateIntradayStats = async () => {
    try {
        const intradayRecords = await Intraday.find({});
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
