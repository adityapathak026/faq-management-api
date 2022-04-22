const User = require("../modal/UserModal");
const Otp = require('../modal/OtpModal');
const jwt = require('jsonwebtoken');
const Cryptojs = require("crypto-js");
const sendEmail = require('../utils/sendEmail');

const UserRegister = async (req, res) => {
    const userData = req.body;
    console.log(userData, 'userdata')
    try {
        if (!userData.userName && !userData.name && !userData.email) {
            res.status(400).json({ Message: 'Please fill all the required fields' });
        }
        const oldUser = await User.findOne({ email: userData.email });
        if (oldUser) {
            res.status(409).json({ Message: 'User already exists' });
        } else if (userData.password !== userData.cpassword) {
            res.status(403).json({ Message: 'Password and confirm password does not match' })
        } else {

            const hashedPassword = Cryptojs.AES.encrypt(userData.password, process.env.SECRET_KEY).toString()
            console.log(hashedPassword, 'pass')

            const newUser = await new User({
                userName: userData.userName,
                name: userData.name,
                email: userData.email,
                password: hashedPassword,
                cpassword: hashedPassword,
                oldPasswords: hashedPassword
            });
            await newUser.save();
            res.status(201).json({ Message: "User registered successfully", newUser });
        };

    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    };
};

const UserLogin = async (req, res) => {
    const loginData = req.body;
    try {
        if (!loginData.userName || !loginData.password) {
            res.status(409).json({ Message: "Please fill all the fields" })
        }
        const user = await User.findOne({ userName: loginData.userName });
        if (user) {
            const hashedPassword = Cryptojs.AES.decrypt(user.password, process.env.SECRET_KEY);
            const originalPassword = hashedPassword.toString(Cryptojs.enc.Utf8);

            if (loginData.password !== originalPassword)
                res.status(401).json({ Message: 'Username or password is incorrect' });

            const accessToken = jwt.sign({ userId: user._id }, process.env.SECRET_TOKEN_KEY, {
                expiresIn: process.env.ACCESS_TOKEN_LIFE,
                algorithm: "HS256"
            });

            const { password, cpassword, ...userData } = user._doc;
            res.status(200).json({ Message: 'Logged In successfully', userData, accessToken });

        } else {
            res.status(404).json({ Message: 'Username not found' })
        };
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
};


const GenerateOtp = async (req, res) => {
    const email = req.body;
    try {
        if (!email) {
            res.status(409).json({ Message: "Please enter your email." });
        };

        const user = await User.findOne(email);
        if (!user) {
            res.status(404).json({ Message: "User is does not exist with this email" })
        } else {
            const code = Math.floor((Math.random() * 10000) + 1);
            const otpData = await new Otp({
                email: user.email,
                otpCode: code,
                expiresIn: new Date().getTime() + 300 * 1000
            });
            await otpData.save();

            const message = `
                <span>Please use below OTP to reset your password</span>
                <h1>Otp : ${code}</h1>
                `

            sendEmail({
                to: user.email,
                text: message,
                subject: "Password Reset Request"
            });

            res.status(200).json({ Message: "Otp sent", otpData })
        };
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    };
};

const verifyPassword = async (user, resetData, res) => {
    user.oldPasswords.map((passwords) => {
        let originalPassword = Cryptojs.AES.decrypt(passwords, process.env.SECRET_KEY).toString(Cryptojs.enc.Utf8);;
        console.log(originalPassword, 'original')

        let hashedPassword = Cryptojs.AES.encrypt(resetData.password, process.env.SECRET_KEY).toString();

        if (user.oldPasswords.length >= 3) {
            originalPassword == resetData.password
                ?
                res.status(401).json({ Message: "You have already used this password." })
                :
                user.oldPasswords.shift();

            user.oldPasswords.push(hashedPassword)
            user.password = hashedPassword;
            user.cpassword = hashedPassword;

            res.status(200).json({ Message: "Password changed successfuly" })
        } else {
            originalPassword == resetData.password ? res.status(401).json({ Message: "You have already used this password." })
                :
                user.oldPasswords.push(hashedPassword)
            user.password = hashedPassword;
            user.cpassword = hashedPassword;
        };
    });
};

const ChangePassword = async (req, res) => {
    const resetData = req.body;
    try {
        const data = await Otp.findById({ _id: resetData.otpId });
        if (data) {
            if (resetData.otpCode == data.otpCode) {
                let currentTime = new Date().getTime();
                let diff = data.expiresIn - currentTime;
                if (diff <= 0) {
                    res.status(410).json({ Error: "Otp expired" })
                } else {
                    let user = await User.findOne({ email: resetData.email });
                    verifyPassword(user, resetData, res);
                    await user.save(resetData);
                    res.status(200).json({ Message: "Password changed successfuly" })
                };
            }
            else { res.status(409).json({ Message: "Wrong Otp" }) };
        }
        else { res.status(409).json({ Message: "Invalid Otp" }) };
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    };
};


module.exports = { UserRegister, UserLogin, GenerateOtp, ChangePassword }