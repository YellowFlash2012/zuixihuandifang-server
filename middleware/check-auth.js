const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; //authorization:'BEARER token'. Wea re just extracting the token here

        if (!token) {
            throw new Error('Authentication failed')
        }

        const decodedToken = jwt.verify(token, 'process.env.jwt_token');

        req.userData = { userId: decodedToken.userId };

        next();

    } catch (err) {
        const error = new HttpError('Authentication failed!', 401);

        return next(error);
    }
}