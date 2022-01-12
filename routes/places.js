const express = require("express");

const { v4:uuidv4 } = require("uuid");

const HttpError = require("../models/http-error");

const router = express.Router();

let places = [
    {
        id: "p1",
        title: "Mount Kilimandjaro",
        description: "One of the highest summits in the world",
        imageUrl:
            "https://images.unsplash.com/photo-1631646109206-4b5616964f84?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8a2lsaW1hbmphcm98ZW58MHx8MHx8&auto=format&fit=crop&w=600&q=60",
        address: "Tanzania",
        location: {
            lat: -3.066610340538903,
            lng: 37.35562724547823,
        },
        creator: "u1",
    },

    {
        id: "p2",
        title: "Cristo Redentor",
        description: "Giant tall mountaintop statue of jesus",
        imageUrl:
            "https://images.unsplash.com/photo-1608378963517-1c47051c7415?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8N3x8Y3Jpc3RvJTIwcmVkZW50b3J8ZW58MHx8MHx8&auto=format&fit=crop&w=600&q=60",
        address:
            "2QXQ+6R Alto da Boa Vista, Rio de Janeiro - State of Rio de Janeiro, Brazil",
        location: {
            lat: -22.951733154576512,
            lng: -43.210058067100604,
        },
        creator: "u2",
    },

    {
        id: "p3",
        title: "Empire State Building",
        description: "Supermassive summit in NY",
        imageUrl:
            "https://images.unsplash.com/photo-1508094214466-708a7d21c5c0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=861&q=80",
        address: "New York, NY 10001, USA",
        location: {
            lat: 40.7484405,
            lng: -73.9878584,
        },
        creator: "u2",
    },
];

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
router.post('/', (req, res, next) => {
    const { title, description, coordinates, address, creator } = req.body;

    const createdPlace = {
        id:uuidv4(),
        title,
        description,
        location: coordinates,
        address,
        creator
    }

    places.push(createdPlace);

    res.status(201).json({place:createdPlace})
});

// ***edit an existing place****
router.patch("/:pid", (req, res, next) => {
    const { title, description } = req.body;
    const placeId = req.params.pid;

    const placeToUpdate = { ...places.find(p => p.id === placeId) };

    const placeIndex = places.findIndex(p => p.id === placeId);

    placeToUpdate.title = title;
    placeToUpdate.description = description;

    places[placeIndex] = placeToUpdate;

    // 201 is for created items
    res.status(200).json({ place: placeToUpdate });
})

// ****delete a place*****
router.delete("/:pid", (req, res, next) => {
    const placeId = req.params.pid;
    places = places.filter(p => p.id !== placeId);

    res.status(200).json({ msg: 'Deleted place.' });
})

module.exports = router;
