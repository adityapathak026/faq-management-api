const { UserRegister, UserLogin } = require('../controller/userController');
const Router = require('express').Router();

Router.route("/register").post(UserRegister);
Router.route("/login").post(UserLogin);

module.exports = Router;