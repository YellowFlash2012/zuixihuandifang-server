const express = require("express");

const router = express.Router();

const { v4: uuidv4 } = require("uuid");

const HttpError = require("../models/http-error");

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
router.get("/", (req, res, next) => {
    res.json({ users: users });
})

// ****users signup****
router.post("/signup", (req, res, next) => {
    const { name, email, password } = req.body;

    // check for existing user
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        throw new HttpError(
            "Email already exists",
            422
        );
    }

    const createdUser = {
        id: uuidv4(),
        name, //name:name
        email,
        password
    };

    users.push(createdUser);

    res.status(201).json({ user: createdUser });
})

// ****users login****
router.post("/login", (req, res, next) => {
    const { email, password } = req.body;

    const identifiedUser = users.find(u => u.email === email);

    if (!identifiedUser || identifiedUser.password !==password) {
        throw new HttpError(
            "Could not identify a user, Invalid credentials",
            401
        );
    } 

    res.json({msg:'Login Successful'})
})


module.exports = router;
