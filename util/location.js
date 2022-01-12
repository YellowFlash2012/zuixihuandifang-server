const { default: axios } = require("axios");
const HttpError = require("../models/http-error");

let dotenv = require('dotenv').config()

const api_key = process.env.api_key

const getCoordsForAddress = async (address) => {
    const res = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${api_key}`);

    const data = res.data;
    console.log(data);

    if (!data || data.status === 'ZERO_RESULTS') {
        const error = new HttpError('Could NOT find location for the specified address', 422);

        throw error;
    }

    const coordinates = data.results[0].geometry.location;

    return coordinates;
}

module.exports = getCoordsForAddress;