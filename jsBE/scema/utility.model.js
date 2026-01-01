const mongoose = require('mongoose');
const { Schema } = mongoose;

const UtilitySchema = new Schema({
    ltpStatus: { type: Boolean},
    utilitySchemaIdentifier: { type: Boolean, required: true },
    luckyLtpStatus: { type: Boolean },
});


const dynamicCollectionName = "UtilitySchemaDetails";//+(new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })).split(',')[0];
const UtilitySchemaDetails = mongoose.model(dynamicCollectionName, UtilitySchema);
module.exports = UtilitySchemaDetails;