const mongoose = require('mongoose');

const UserSchmea = new mongoose.Schema({
    userName: { type: String, required: true, unique: true },
    name: String,
    email: { type: String, required: true },
    password: String,
    cpassword: String,
    oldPasswords: Array,
},
    { timestamps: true }
);

const User = mongoose.model('User', UserSchmea);

module.exports = User;
