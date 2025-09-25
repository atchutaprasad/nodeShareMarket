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
            type: String
        },
        symbol: {
            type: String
        },
        ltp:{
            type: Array
        }
    },
    {
        timestamps: true
    }
);

const Intraday = mongoose.model("Intraday", IntradaySchema);
module.exports = Intraday;