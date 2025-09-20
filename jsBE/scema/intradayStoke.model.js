const mongoose = require('mongoose');

const IntradaySchema = mongoose.Schema(
    {
        exchange: {
            type: String,
            require: [true, 'exchange name is required']
        },
        Symbolname: {
            type: String,
            require: [true, 'exchange name is required']
        },
        multiplier: {
            type: String,
            require: [true, 'exchange name is required']
        },
        multiplierTwo: {
            type: String,
            require: [true, 'exchange name is required']
        },
        token: {
            type: String,
            require: false
        }
    },
    {
        timestamps: true
    }
);

const Intraday = mongoose.model("Intraday", IntradaySchema);
module.exports = Intraday;