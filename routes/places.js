const express = require("express");

const { v4: uuidv4 } = require("uuid");

const { check, validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");

const Places = require("../models/places");

const router = express.Router();


//***** get places by id *******
router.get("/:pid", (req, res, next) => {
    const placeId = req.params.pid; //{pid:'p1}
    const place = places.find((p) => {
        return p.id === placeId;
    });

    if (!place) {
        throw new HttpError(
            "Can't find a place that satisfies your request. Try with another ID",
            404
        );
    }

    res.json({ place: place });
});


// *****get places by userId *****

router.get("/user/:uid", (req, res, next) => {
    const userId = req.params.uid;

    const userPlaces = places.filter((u) => {
        return u.creator === userId;
    });

    if (userPlaces.length === 0) {
        return next(
            new HttpError(
                "Can't find anything related to that user. Try another one!",
                404
            )
        );
    }

    res.json({ user: userPlaces });
});

// *****create new place******
router.post('/', [check('title').not().isEmpty(), check('description').isLength({ min: 5 }), check('address').not().isEmpty()], async (req, res, next) => {
    
    // validation with express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty) {
        console.log(errors);
        return next(new HttpError('Fields can NOT be empty', 422));
    }

    const { title, description, address, image, creator } = req.body;

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
        image,
        address,
        creator
    });

    try {
        await createdPlace.save();
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
    (req, res, next) => {
        
        // validation with express-validator
        const errors = validationResult(req);
        if (!errors.isEmpty) {
            console.log(errors);
            throw new HttpError("Fields can NOT be empty", 422);
        }

        const { title, description } = req.body;
        const placeId = req.params.pid;

        const placeToUpdate = { ...places.find((p) => p.id === placeId) };

        const placeIndex = places.findIndex((p) => p.id === placeId);

        placeToUpdate.title = title;
        placeToUpdate.description = description;

        places[placeIndex] = placeToUpdate;

        // 201 is for created items
        res.status(200).json({ place: placeToUpdate });
    }
);

// ****delete a place*****
router.delete("/:pid", (req, res, next) => {
    const placeId = req.params.pid;

    if (!places.find(p=>p.id===placeId)) {
        throw new HttpError('No place match that id', 404)
    }
    places = places.filter(p => p.id !== placeId);

    res.status(200).json({ msg: 'Deleted place.' });
})

module.exports = router;
