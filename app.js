const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const PORT = process.env.PORT || 3000;

require('dotenv').config();

const app = express();

app.use(cors())

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-TypeError, Accept');
    next();
})

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const noteRouter = require('./routes/note');
const userRouter = require('./routes/user');

const verifyToken = require('./middleware/verifytoken');

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/note', noteRouter);
app.use('/user', userRouter);

app.get("/islogin", verifyToken, function (req, res) {
    jwt.verify(req.token, process.env.TOKEN_KEY, async (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            res.send(true);
        }

    })
});

const uri = process.env.ATLAS_URI;
const option = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};
mongoose.connect(uri, option);

const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
    app.listen(PORT, () => {
        console.log('Server started!',PORT);
    })
})


