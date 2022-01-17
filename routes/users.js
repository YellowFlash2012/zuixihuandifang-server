const express = require("express");

const router = express.Router();

// const { v4: uuidv4 } = require("uuid");

const { check, validationResult } = require("express-validator");

const Users = require("../models/users");

const HttpError = require("../models/http-error");

const fileUpload = require("../middleware/file-upload");

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

    const createdUser = new Users({
        name, //name:name
        email,
        password,
        image: "https://images.unsplash.com/photo-1631646109206-4b5616964f84?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8a2lsaW1hbmphcm98ZW58MHx8MHx8&auto=format&fit=crop&w=600&q=60",
        places: [], //empty array because 1 user can have many places
    });

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError("Could not signup right now, please try again later.", 500);

        return next(error);
    }

    res.status(201).json({ user: createdUser.toObject({ getters: true }) });
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

    if (!existingUser || existingUser.password !== password) {
        console.log(existingUser.password);
        console.log(password);
        const error = new HttpError("Invalid credentials", 401);

        return next(error);
    }

    res.json({ msg: 'Login Successful', user: existingUser.toObject({ getters: true }) });
})


module.exports = router;
