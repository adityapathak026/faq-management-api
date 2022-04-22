const Faq = require('../modal/FaqModal');

const CreateFaq = async (req, res) => {
    const faqData = req.body;
    console.log(faqData, 'faqdata')
    try {
        if (!faqData.question || !faqData.answer) {
            res.status(409).json({ Message: "Please add all the required fields" })
        };
        const newFaq = await new Faq(faqData);
        await newFaq.save();
        res.status(200).json({ Message: "FAQ added successfully", newFaq })
    } catch (error) {
        console.log(error)
        res.status(500).json(error);
    };
};

const AllFaqs = async (req, res) => {
    try {
        const faqs = await Faq.find();
        res.status(200).json(faqs);
    } catch (error) {
        res.status(500).json(error)
    }
}

module.exports = { CreateFaq, AllFaqs };