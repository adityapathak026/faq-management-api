const mongoose = require('mongoose');

const FaqSchema = new mongoose.Schema({
    categories: Object,
    categoryId: String,
    question: String,
    answer: String
},
    { timestamps: true }
);

const Faq = mongoose.model('Faq', FaqSchema);

module.exports = Faq;
