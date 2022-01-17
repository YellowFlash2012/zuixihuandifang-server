const express = require("express");

const fs = require('fs');

// const { v4: uuidv4 } = require("uuid");

const { check, validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");

const Places = require("../models/places");
const Users = require("../models/users");
const mongoose = require("mongoose");
const fileUpload = require("../middleware/file-upload");

const checkAuth = require("../middleware/check-auth");


const router = express.Router();


//***** get places by id *******
router.get("/:pid", async (req, res, next) => {
    const placeId = req.params.pid; //{pid:'p1}

    let place;
    try {
        place = await Places.findById(placeId);
    } catch (err) {
        const error = new HttpError(
            "Something went wrong, no connection with db", 500
        );
        return next(error);
    }
    
    if (!place) {
        const error = new HttpError("Can't find a place that satisfies your request. Try with another ID", 404);

        return next(error);
    }
    

    res.json({ place: place.toObject({getters:true}) });
});


// *****get places by userId *****

router.get("/user/:uid", async (req, res, next) => {
    const userId = req.params.uid;

    let userPlaces;

    try {
        userPlaces = await Users.findById(userId).populate('places');
    } catch (err) {
        const error = new HttpError("Fetching places failed", 500);

        return next(error);
    }
    

    if (!userPlaces || userPlaces.length === 0) {
        return next(
            new HttpError(
                "Can't find anything related to that user. Try another one!",
                404
            )
        );
    }

    res.json({
        places: userPlaces.places.map((place) => place.toObject({ getters: true })),
    });
});

// *****middleware to protect sensible routes****
router.use(checkAuth);

// *****create new place******
// [check('title').not().isEmpty(), check('description').isLength({ min: 5 }), check('address').not().isEmpty()],
router.post('/', fileUpload.single('image'), async (req, res, next) => {
    
    // validation with express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty) {
        console.log(errors);
        return next(new HttpError('Fields can NOT be empty', 422));
    }

    const { title, description, address, creator } = req.body;

    let coordinates;

    try {
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        console.log(error);
        return next(error);
    }

    const createdPlace = new Places({
        title,
        description,
        location: coordinates,
        image: req.file.path,
        address,
        creator,
    });

    let user;
    try {
        user = await Users.findById(creator);
    } catch (err) {
        const error = new HttpError("Can't find that user, try another one", 500);

        return next(error);
    }

    if (!user) {
        const error = new HttpError("Could not find a user with that id", 404);
        return next(error);
    }

    try {
        const session = await mongoose.startSession();
        
        session.startTransaction();
        await createdPlace.save({ session: session });

        user.places.push(createdPlace); //push allows mongoose to establish connection between the 2 models. places here refers to the name of the collection in mongoatlas
        await user.save({ session: session });
        await session.commitTransaction();
        console.log(session, user.places);
    } catch (err) {
        const error = new HttpError('Creating place failed, please try again!', 500);

        return next(error);

        
    }

    res.status(201).json({place:createdPlace})
});

// ***edit an existing place****
router.patch(
    "/:pid",
    [
        check("title").not().isEmpty(),
        check("description").isLength({ min: 5 })
    ],
    async (req, res, next) => {
        
        // validation with express-validator
        const errors = validationResult(req);
        if (!errors.isEmpty) {
            console.log(errors);
            return next(new HttpError("Fields can NOT be empty", 422));
        }

        const { title, description } = req.body;
        const placeId = req.params.pid;

        let placeToUpdate;

        try {
            placeToUpdate = await Places.findById(placeId);
        } catch (err) {
            const error = new HttpError("Can't fetch data from db, try again later", 500);

            return next(error);
        }

        if (place.creator.toString() !== req.userData.userId) {
            const error = new HttpError("You are not allowed to edit this place.", 401);

            return next(error);
        }

        placeToUpdate.title = title;
        placeToUpdate.description = description;

        try {
            await placeToUpdate.save();
        } catch (err) {
            const error = new HttpError("Can't update place now, please try again later", 500);

            return next(error);
        }

        // 201 is for created items
        res.status(200).json({ place: placeToUpdate.toObject({ getters: true }) });
    }
);

// ****delete a place*****
router.delete("/:pid", async (req, res, next) => {
    const placeId = req.params.pid;

    let place;

    try {
        place = await Places.findById(placeId).populate('creator'); //populate() makes it easy to access documents stored in different collections
    } catch (err) {
        const error = new HttpError("Something doesn't add up, can't delete place now.", 500);

        return next(error);
    }

    if (!place) {
        const error = new HttpError("Can NOT find a place with that id", 404);

        return next(error);
    }

    const imagePath = place.image;

    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        await place.remove({ session: session });

        place.creator.places.pull(place); //places refers to the name of the collection in mongoAtlas. pull allows to remove the id from the document
        await place.creator.save({ session: session });
        await session.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            "Something doesn't add up, can't delete place now.",
            500
        );

        return next(error);
    }

    fs.unlink(imagePath, err => {
        console.log(err);
    })

    res.status(200).json({ msg: 'Place deleted.' });
})

module.exports = router;
