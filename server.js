const express = require("express");

const bodyParser = require("body-parser");

const placesRoutes = require('./routes/places');

const usersRoutes = require('./routes/users');

const app = express();

app.use('/api/places', placesRoutes);

app.use('/api/users', usersRoutes);

app.listen(5000, () => {
    console.log("Server on | Port 5000");
})