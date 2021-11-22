const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const Users = require('../models/users')

const jsonParser = bodyParser.json()

router.get('/', async function (req, res, next) {
    const user = await Users.find();
    res.send(user);
});

router.post('/login', jsonParser, async function (req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(200).send({
            message: 'Please try again'
        });
    }
    const user = await Users.findOne({ email }).exec();
    if (user) {
        bcrypt.compare(password, user.password, function (err, result) {
            console.log(result);
            console.log(user);
            if (result) {

                const payload = {
                    "_id": user._id,
                    "email": user.email,
                    "username": user.username
                }

                jwt.sign(payload, process.env.TOKEN_KEY,{ expiresIn: "48h"}, (err, token) => {
                    res.json({
                        token: token
                    })
                })
            } else {
                res.status(200).send({
                    message: 'Username or Password incorrect!'
                });
            }
        });
    } else {
        res.status(200).send({
            message: 'Username does not exist.'
        });
    }
});

router.post('/register', jsonParser, async function (req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        res.status(200).send({
            message: 'Please try again'
        });
    }
    const user1 = await Users.findOne({ email }).exec();
    if (user1) {
        res.status(200).send({
            message: 'This email already use, please login.'
        });
    }
    const user2 = await Users.findOne({ username }).exec();
    if (user2) {
        res.status(200).send({
            message: 'This username already use, please change.'
        });
    }
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, function (err, hash) {
        const user = new Users({
            username,
            email,
            password: hash,
            notes: []
        });
        user.save();
    });

    res.send('Successful register!');
});

module.exports = router;