const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser')
const dotenv = require('dotenv');
const authRoute = require('./routes/authRoute');
const userRoute = require('./routes/userRoute');
const faqRoute = require('./routes/faqRoute');

app = express();

dotenv.config({ path: "./.env" });

// To do a cross origin connection with another port.
app.use(cors());

// To access JSON data
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

//Middleware To get access to req.body Object
app.use(express.json());

app.use("", authRoute);
app.use("", userRoute);
app.use("", faqRoute);

//// Database Connecton
const MONGO_URL = process.env.DATABASE_URL;
mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connection is successful '))
    .catch((error) => console.log(error));


// Catching uncaught exceptions to prevent app crashing.
const handleRequest = function (req, res) {
    res.writeHead(200);
    res.end('Hello, World!');
};
const server = require('http').createServer(handleRequest);
process.on('uncaughtException', function (err) {
    console.error('There was an uncaught error', err)
    process.exit(1)
});

//Localhost server connection
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is listening on localhost ${PORT}`)
});
