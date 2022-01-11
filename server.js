const express = require("express");

const bodyParser = require("body-parser");

const placesRoutes = require('./routes/places');

const usersRoutes = require('./routes/users');
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

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

app.listen(5000, () => {
    console.log("Server on | Port 5000");
})