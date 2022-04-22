const { verify } = require('jsonwebtoken');
const { GenerateOtp, ChangePassword } = require('../controller/userController');
const { Verify } = require('./verify');
const Router = require('express').Router();


Router.route("/sendOtp").post(verify, GenerateOtp);

Router.route("/resetpassword").post(Verify, ChangePassword)

module.exports = Router;
