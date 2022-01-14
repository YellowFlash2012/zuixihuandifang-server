const express = require("express");

const bodyParser = require("body-parser");

const placesRoutes = require('./routes/places');

const mongoose = require("mongoose");
let dotenv = require("dotenv").config();

const usersRoutes = require('./routes/users');

const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

// ****CORS handling****
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

    next();
});

app.use('/api/places', placesRoutes);

app.use('/api/users', usersRoutes);

//*** wrong route error handling***
app.use((req, res, next) => {
    const error = new HttpError('Could NOT find this page', 404);

    throw error;
})

// error handling middleware
app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    res.status(error.code || 500);

    res.json({ msg: error.message || "An unknown error occurred!" });
});

// ****db connection****
mongoose
    .connect(process.env.MONGO_URI)
    .then(
        app.listen(5000, () => {
            console.log("Server on | Port 5000");
            console.log("db connected!");
        })
    )
    .catch(err => {
        console.log(err);
    });

