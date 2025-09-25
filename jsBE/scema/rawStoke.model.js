const mongoose = require('mongoose');

const RawSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            require: [true, 'exchange is required']
        },
        symbol: {
            type: String,
            require: [true, 'symbol is required']
        },
        name: {
            type: String,
            require: [true, 'name is required'],
            unique: true,
        },
        expiry: {
            type: String,
            require: [true, 'expiry is required']
        },
        strike: {
            type: String,
            require: [true, 'strike is required']
        },
        lotsize: {
            type: String,
            require: [true, 'lotsize is required']
        },
        instrumenttype: {
            type: String,
            require: [true, 'instrumenttype is required']
        },
        exch_seg: {
            type: String,
            require: [true, 'exch_seg is required']
        },
        tick_size: {
            type: Number,
            require: [true, 'tick_size is required']
        }
    },
    {
        timestamps: true
    }
);

const RawStokes = mongoose.model("RawStokes", RawSchema);
module.exports = RawStokes;