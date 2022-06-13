const express = require("express");

const fs = require("fs");
const path = require('path');

const mongoose = require("mongoose");
const cors = require("cors")
const helmet = require("helmet")
const colors = require("colors")
const morgan=require("morgan")

const placesRoutes = require('./routes/places');
const usersRoutes = require('./routes/users');
const HttpError = require("./models/http-error");

let dotenv = require("dotenv").config();

const app = express();
app.use(express.json())
app.use(cors())
app.use(helmet())

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

//middleware for handling static file upload, like images
app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use(express.static(path.join("public")));

// ****CORS handling****
// app.use((req, res, next) => {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
//     res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

//     next();
// });

app.use('/api/places', placesRoutes);

app.use('/api/users', usersRoutes);

// for serving the frontend
// const __dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/client/build")));

    app.get("*", (req, res) =>
        res.sendFile(path.resolve(__dirname, "client", "build", "index.html"))
    );
} else {
    app.get("/", (req, res) => {
        res.send("API is running....");
    });
}

//*** wrong route error handling***
app.use((req, res, next) => {
    const error = new HttpError('Could NOT find this page', 404);

    throw error;
})

// error handling middleware
app.use((error, req, res, next) => {
    // image upload error config
    if (req.file) {
        fs.unlink(req.file.path, err => {
            console.log(err);
        });
    }
    if (res.headersSent) {
        return next(error);
    }

    res.status(error.code || 500);

    res.json({ msg: error.message || "An unknown error occurred!" });
});

// ****db connection****
mongoose
    .connect(process.env.MONGO_URI, {
        
    })
    .then(
        app.listen(PORT, () => {
            console.log(`Server on | Port ${PORT}`);
            console.log("db connected!".cyan.underline.bold);
        })
    )
    .catch((err) => {
        console.log(err);
    });

