const express = require("express");

const router = express.Router();

// const { v4: uuidv4 } = require("uuid");

const { check, validationResult } = require("express-validator");

const Users = require("../models/users");

const HttpError = require("../models/http-error");

const fileUpload = require("../middleware/file-upload");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const users = [
    {
        id: "u1",
        name: "Marco Materrazi",
        email: "marco@email.io",
        password:"qhbshdbvbpwv"
    },
    {
        id: "u2",
        name: "kikwette jakaya",
        email: "kik@email.io",
        password:"qhbshdbvbpwv"
    },
    {
        id: "u3",
        name: "Pedro Machado",
        email: "pedro@email.io",
        password:"qhbshdbvbpwv"
    }
]

// ****get all users****
router.get("/", async (req, res, next) => {
    let users;

    try {
        users = await Users.find({}, '-password');
    } catch (err) {
        const error = new HttpError("Fetching users failed, please try again later", 500);

        return next(error);
    }
    
    res.json({ users: users.map(user => user.toObject({ getters: true })) });
})

// ****users signup****
router.post("/signup", fileUpload.single('image'), [
    check("email").normalizeEmail().isEmail(),
    // normalizeEmail = Test@test.io => test@test.io
        check("password").isLength({ min: 13 })
], async (req, res, next) => {
    
    // validation with express-validator
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors);
            return next(new HttpError("Check email field again!", 422));
    }
    
    const { name, email, password} = req.body;

    // check for existing user
    let existingUser;

    try {
        existingUser = await Users.findOne({ email: email });
    } catch (err) {
        const error = new HttpError("Signing up failed, please try again later", 500);

        return next(error);
    }

    if (existingUser) {
        const error = new HttpError("User exists already, please login instead", 422);

        return next(error);
    }

    // bcrypt config
    let hashedpw;
    try {
        hashedpw = await bcrypt.hash(password, 13);
    } catch (err) {
        const error = new HttpError("Could not create user, please try again", 500);
        return next(error)
    }

    const createdUser = new Users({
        name, //name:name
        email,
        password:hashedpw,
        image: req.file.path,
        places: [], //empty array because 1 user can have many places
    });

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError("Could not signup right now, please try again later.", 500);

        return next(error);
    }

    // jwt config
    let token;
    try {
        token = jwt.sign(
            {
                userId: createdUser.id,
                email: createdUser.email,
            },
            "process.env.jwt_token",
            { expiresIn: "1h" }
        );
    } catch (err) {
        const error = new HttpError(
            "Could not signup right now, please try again later.",
            500
        );

        return next(error);
    }

    res.status(201).json({ userId: createdUser.id, email:createdUser.email, token:token });
})

// ****users login****
router.post("/login", async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;

    try {
        existingUser = await Users.findOne({ email: email });
    } catch (err) {
        const error = new HttpError(
            "Login failed, please try again later",
            500
        );

        return next(error);
    }

    if (!existingUser) {
        console.log(existingUser);
        console.log(password);
        const error = new HttpError(
            "A user with this account could NOT be found",
            401
        );

        return next(error);
    }

    let isValidPassword = false;

    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        const error = new HttpError("Invalid credentails", 500);

        return next(error);
    }

    if (!isValidPassword) {
        const error = new HttpError(
            "A user with this account could NOT be found",
            401
        );

        return next(error);
    }

    // jwt config
    let token;
    try {
        token = jwt.sign(
            {
                userId: existingUser.id,
                email: existingUser.email,
            },
            "process.env.jwt_token",
            { expiresIn: "1h" }
        );
    } catch (err) {
        const error = new HttpError(
            "Could not login right now, please try again later.",
            500
        );

        return next(error);
    }

    res.json({
        userId: existingUser.id,
        email: existingUser.email,
        token: token,
        
    });
})


module.exports = router;
