const mongoose = require('mongoose');
const { Schema } = mongoose;

const UtilitySchema = new Schema({
    ltpStatus: { type: Boolean, required: true }
});

const UtilitySchemaDetails = mongoose.model("UtilitySchemaDetails", UtilitySchema);
module.exports = UtilitySchemaDetails;