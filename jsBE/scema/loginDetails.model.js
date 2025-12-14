const mongoose = require('mongoose');

const LoginDetailsSchema = new mongoose.Schema(
    {
        session: {
            type: Object,
            require: [true, 'session is required']
        }
    },
    {
        timestamps: true
    }
);

const dynamicCollectionName = "LoginDetails";//+(new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })).split(',')[0];
const LoginDetails = mongoose.model(dynamicCollectionName, LoginDetailsSchema);
module.exports = LoginDetails;