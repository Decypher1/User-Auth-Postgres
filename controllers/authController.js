const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const {check, validationResult} = require('express-validator')
require('dotenv').config()
const User = require('../model/user_model')
const Organization = require('../model/organization')
const UserOrganization = require('../model/userOrganization')
const { generateAccessToken, sendValidationErrors } = require('../utils/helpers')
const secret = process.env.JWT_SECRET;

const register = [
    check('firstName').not().isEmpty(),
    check('lastName').not().isEmpty(),
    check('email').isEmail(),
    check('password').isLength({ min: 8 }),
    async (req, res) => {
        sendValidationErrors(req, res);
        const { firstName, lastName, email, password, phone } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try{
            await sequelize.transaction(async (t) => {
                const user = await User.create({ firstName, lastName, email, password: hashedPassword, phone }, { transaction: t });
                const orgName = `${firstName}'s Organization`;
                const organization = await Organization.create({ name: orgName }, { transaction: t });
                await user.addOrganization(organization, { transaction: t });

                const accessToken = generateAccessToken(user.userId, user.email);
                res.status(201).json({
                    status: 'success',
                    message: 'Registration successful',
                    data: {
                        accessToken,
                        user: {
                            userId: user.userId,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            phone: user.phone
                        }
                    }
                });
            });
        } catch (error) {
            res.status(400).json({
                status: 'Bad request',
                message: 'Registration Not Successful',
                statusCode: 400
            });
        }
    }
];

const login = [
    check('email').isEmail(),
    check('password').not().isEmpty(),
    async (req, res) => {
        sendValidationErrors(req, res);
        const { email, password } = req.body;

        try {
            const user = await User.findOne({ where: { email } });
            if (user && await bcrypt.compare(password, user.password)) {
                const accessToken = generateAccessToken(user.userId, user.email);
                res.status(200).json({
                    status: 'success',
                    message: 'Login successful',
                    data: {
                        accessToken,
                        user: {
                            userId: user.userId,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            phone: user.phone
                        }
                    }
                });
            } else {
                res.status(401).json({
                    status: 'Bad request',
                    message: 'Authentication failed',
                    statusCode: 401
                });
            }
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message:error.message
            });
        }
    }
];

module.exports = {register, login}