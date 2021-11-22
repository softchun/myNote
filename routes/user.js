const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifytoken');
const bodyParser = require('body-parser');

const Users = require('../models/users')

const jsonParser = bodyParser.json()

router.get('/', verifyToken, jsonParser, async function (req, res, next) {

    jwt.verify(req.token, process.env.TOKEN_KEY, async (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            const _id = authData._id;
            const user = await Users.findOne({ _id }).exec();

            res.send({
                username: user.username,
                email: user.email
            });
        }

    })

});

router.post('/edit', verifyToken, jsonParser, async function (req, res, next) {

    jwt.verify(req.token, process.env.TOKEN_KEY, async (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            const _id = authData._id;
            const username_new = req.body.username;
            const user = await Users.findOne({ _id }).exec();
            const username = user.username;
            const user2 = await Users.findOne({ username: username_new }).exec();
            
            if (!user) {
                res.send("Not found");
            } else if (user2 && (username !== username_new)) {
                res.send("Username already used, please change.");
            } else if (username_new != null) {
                user.username = username_new;
                user.save();
                res.send("Successful!");
            } else {
                res.status(200).send({
                    message: 'Please try again'
                });
            }

        }
    })
});

module.exports = router;