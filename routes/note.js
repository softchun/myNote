const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifytoken');
const bodyParser = require('body-parser');

const Users = require('../models/users')
const Notes = require('../models/notes')

const jsonParser = bodyParser.json()

router.post('/', verifyToken, jsonParser, async function (req, res, next) {

    jwt.verify(req.token, process.env.TOKEN_KEY, async (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            const _id = authData._id;
            const note_id = req.body._id;
            const note = await Notes.findOne({ _id: note_id, deleted: false }).exec();
            
            if (note && note.user_id === _id) {
                res.send(note);
            } else {
                res.send("Not found");
            }
        }
    })
});

router.post('/view', verifyToken, jsonParser, async function (req, res, next) {

    jwt.verify(req.token, process.env.TOKEN_KEY, async (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            const _id = authData._id;
            const user = await Users.findOne({ _id }).exec();
            const username = user.username;
            const note_id = req.body._id;
            const note = await Notes.findOne({ _id: note_id, deleted: false }).exec();
            const user2 = await Users.findOne({ _id: note.user_id }).exec();
            
            if (note) {
                let data = {
                    _id: note._id,
                    username: username,
                    note_username: user2.username,
                    title: note.title,
                    content: note.content,
                    color: note.color,
                    privacy: note.privacy,
                    deleted: note.deleted,
                    createdAt: note.createdAt,
                    updatedAt: note.updatedAt,
                    fav: false
                }
                if ((user.fav_notes).indexOf(note._id) !== -1) {
                    Object.assign(data, { fav: true });
                }
                if (username !== user2.username && note.privacy === "private") {
                    res.send("Not found");
                } else {
                    res.send(data);
                }
            } else {
                res.send("Not found");
            }
        }
    })
});

router.get('/mynotes', verifyToken, jsonParser, async function (req, res, next) {

    jwt.verify(req.token, process.env.TOKEN_KEY, async (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            const _id = authData._id;
            const user = await Users.findOne({ _id }).exec();
            const username = user.username;
            const notes = await Notes.find({ user_id: _id, deleted: false }).exec();
            let list = [];
            for (let note of notes) {
                let data = {
                    _id: note._id,
                    username: username,
                    title: note.title,
                    content: note.content,
                    color: note.color,
                    privacy: note.privacy,
                    deleted: note.deleted,
                    createdAt: note.createdAt,
                    updatedAt: note.updatedAt,
                    fav: false
                };
                if ((user.fav_notes).indexOf(note._id) !== -1) {
                    Object.assign(data, { fav: true });
                }
                list.push(data);
            }
            res.send(list);
        }
    })
});

router.get('/all', verifyToken, jsonParser, async function (req, res, next) {

    jwt.verify(req.token, process.env.TOKEN_KEY, async (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            const notes = await Notes.find({ deleted: false, privacy: "public" }).exec();
            let list = [];
            for (let note of notes) {
                const user = await Users.findOne({ _id: note.user_id }).exec();
                let data = {
                    _id: note._id,
                    username: user.username,
                    title: note.title,
                    content: note.content,
                    color: note.color,
                    privacy: note.privacy,
                    deleted: note.deleted,
                    createdAt: note.createdAt,
                    updatedAt: note.updatedAt,
                    fav: false
                };
                if ((user.fav_notes).indexOf(note._id) !== -1) {
                    Object.assign(data, { fav: true });
                }
                list.push(data);
            }
            res.send(list);
        }
    })
});

router.get('/favlist', verifyToken, jsonParser, async function (req, res, next) {

    jwt.verify(req.token, process.env.TOKEN_KEY, async (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            const _id = authData._id;
            const user = await Users.findOne({ _id }).exec();
            const notes = await Notes.find({ user_id: user._id, deleted: false }).exec();
            let list = [];
            for (let note of notes) {
                if ((user.fav_notes).indexOf(note._id) !== -1) {
                    list.push(note);
                }
            }
            res.send(list);
        }
    })
});

router.post('/add', verifyToken, jsonParser, async function (req, res, next) {

    jwt.verify(req.token, process.env.TOKEN_KEY, async (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            const _id = authData._id;
            const { title, content, color, privacy } = req.body;
            const note = new Notes({
                user_id: _id,
                title,
                content,
                color,
                privacy,
                deleted: false
            });
            note.save();
            res.send(note);
        }
    })
});

router.post('/addfav', verifyToken, jsonParser, async function (req, res, next) {

    jwt.verify(req.token, process.env.TOKEN_KEY, async (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            const _id = authData._id;
            const note_id = req.body._id;
            const user = await Users.findOne({ _id }).exec();
            if (user && note_id !== null) {
                const i = (user.fav_notes).indexOf(note_id);
                if ( i !== -1) {
                    (user.fav_notes).splice(i, 1);
                    user.save();
                    res.send("Successful delete from fav.");
                } else {
                    (user.fav_notes).push(note_id);
                    user.save();
                    res.send("Successful add to fav.");
                }

            } else {
                res.send("Not found")
            }
        }
    })
});

router.post('/edit', verifyToken, jsonParser, async function (req, res, next) {

    jwt.verify(req.token, process.env.TOKEN_KEY, async (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            const _id = authData._id;
            const { title, content, color, privacy } = req.body;
            const note_id = req.body._id;
            const note = await Notes.findOne({_id: note_id}).exec();

            if (!note || _id !== note.user_id) {
                res.send("Not found");
            }

            if (title != null) {
                note.title = title;
            }
            if (content != null) {
                note.content = content;
            }
            if (color != null) {
                note.color = color;
            }
            if (privacy != null) {
                note.privacy = privacy;
            }

            note.save();
            res.send(note);
        }
    })
});

router.post('/delete', verifyToken, jsonParser, async function (req, res, next) {

    jwt.verify(req.token, process.env.TOKEN_KEY, async (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            const _id = authData._id;
            const note_id = req.body._id;
            const note = await Notes.findOne({_id: note_id}).exec();

            console.log(req.body);

            if (!note || _id !== note.user_id) {
                res.send("Not found");
            }

            note.deleted = true;

            note.save();
            res.send("the note is deleted.");
        }
    })
});

module.exports = router;