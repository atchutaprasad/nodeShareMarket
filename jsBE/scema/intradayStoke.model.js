const { OrderedBulkOperation } = require('mongodb');
const mongoose = require('mongoose');

const IntradaySchema = new mongoose.Schema(
    {
        Exchange: {
            type: String,
            require: [true, 'exchange is required']
        },
        name: {
            type: String,
            unique: true,
            require: [true, 'symbol is required']
        },
        Multiplier: {
            type: String,
            require: [true, 'multiplier is required']
        },
        token: {
            type: String,
            index: true 
        },
        symbol: {
            type: String
        },
        volume: {
            type: String
        },
        ltp:{
            type: Array
        },
        ltpPercentage:{
            type: Array
        },
        ltpTime:{
            type: Array
        },
        openTime:{
            type: Array
        },
        open: {
           type: Array
        },
        percentChange: {
            type: String
        },
        buyPrice: {
            type: String
        },
        buyQuantity: {
            type: String
        },
        orderId:{
            type: String
        },
        history: {
            type: Array
        }
    }
);
const dynamicCollectionName = "Intradays";//+(new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })).split(',')[0];

const Intraday = mongoose.model(dynamicCollectionName, IntradaySchema);
const LuckyIntraday = mongoose.model("LuckyIntradays", IntradaySchema);
module.exports = {Intraday, LuckyIntraday};