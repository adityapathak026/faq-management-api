const { CreateFaq, AllFaqs } = require('../controller/faqController')
const Router = require('express').Router();

Router.route("/addfaq").post(CreateFaq);

Router.route("/faqlist").get(AllFaqs)

module.exports = Router;