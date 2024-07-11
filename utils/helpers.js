const {validationResult} = require('express-validator');

const sendValidationErrors = (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
};

const generateAccessToken = (userId, email) => {
    const jwt = require('jsonwebtoken')
    const secret = process.env.JWT_SECRET
    return jwt.sign({userId, email}, secret)
};

module.exports = {sendValidationErrors, generateAccessToken}