const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otpCode: String,
    expiresIn: Number,
}, { timestamps: true }
);

const Otp = mongoose.model('Otp', OtpSchema);

module.exports = Otp;