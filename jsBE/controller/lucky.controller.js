var axios = require("axios");
const mongoose = require('mongoose');
let AutoLogin = require('../scema/loginDetails.model');
const parameters = require('../parameters.js');
let Intraday = require('../scema/intradayStoke.model');
let intradayController = require('./intraday.controller');


const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const getHistory = async (req, res) => {
    try {
        const intradayResults1 = await intradayController.fullyAutomateLoadStokesInterval();
        //const token = req.query.token || req.body.token;
        let d;
        d = new Date();
        d.setDate(d.getDate() - 2); // Get data from 1 days ago
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateString = `${yyyy}-${mm}-${dd}`;

        // Use AutoLogin to fetch saved jwt token
        let loginDetailsObj = await AutoLogin.find({});
        // if (!loginDetailsObj || loginDetailsObj.length === 0) {
        //     return res.status(400).json({ status: false, message: 'No active session found. Login first.' });
        // }
        const authorization = 'Bearer ' + loginDetailsObj[0].session.data.jwtToken;


        const intradayRecords = await Intraday.find({});
        //let tokens = intradayRecords.map(item => item.token.toString());
        console.log('Intraday Records Count:', intradayRecords.length);

        intradayRecords.forEach(async (item, index, array) => {


            setTimeout(async () => {
                
                if (index === array.length - 1) {
                    console.log(`Completed fetching history for all tokens.`);
                }

                const requestBody = {
                    "exchange": "NSE",
                    "symboltoken": item.token.toString(),
                    "interval": "ONE_DAY",
                    "fromdate": `${dateString} 00:00`,
                    "todate": `${dateString} 23:59`
                };
                // const requestBody = {
                //     "exchange": "NSE",
                //     "symboltoken": "99926000",
                //     "interval": "ONE_HOUR",
                //     "fromdate": "2023-09-06 11:15",
                //     "todate": "2023-09-06 12:00"
                // }

                const config = parameters.getCandleDataParams(authorization, requestBody);
                const response = await axios(config).catch((error) => {
                    if (error.isAxiosError) {
                        // Optionally log a minimal message or skip logging
                        console.error('Axios error occurred ------ ' + item.name, error.response?.data);
                        return; // Do nothing, suppress log
                    }
                    // Log other errors if needed
                    console.error(error);
                });

                if (response?.data?.data) {
                   // console.log('Candle Data Request for token', item.name, ':', response?.data?.data);
                    let d = response?.data?.data[0][1] ? (((response?.data?.data[0][4]) - (response?.data?.data[0][1])).toFixed(2)) : 'No Data';
                    await Intraday.findOneAndUpdate(
                        { token: item.token },
                        {
                            $set: { history: [d] }, // Clear existing history
                            
                        },
                        { new: true, runValidators: false }
                    );
                } else {
                    console.log('No Candle Data Request for token', item.name, ':', response?.data?.data);
                }

                //await sleep(1000); // 1 second delay between requests
            }, index * 500); // 3 requests per second



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
        });

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

        const intradayResults = await Intraday.find({});
        console.log('intradayResults' + intradayResults.length)
        res.json(intradayResults);


    } catch (error) {
        //console.error('Error fetching history:', error.message || error);
        res.status(500).json({ status: false, message: error.message || JSON.stringify(error) });
    }
}


module.exports = {
    getHistory
};