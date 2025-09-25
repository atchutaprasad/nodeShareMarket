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

const LoginDetails = mongoose.model("LoginDetails", LoginDetailsSchema);
module.exports = LoginDetails;