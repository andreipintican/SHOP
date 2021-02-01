require('dotenv').config();

const express = require('express');
const request = require('request');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const User = require('./model/User');

const app = express();
app.use(bodyParser.json());

const port = 4100;

mongoose
    .connect('mongodb://mongo:27017/shop-app', { useNewUrlParser: true })
    .then(() => console.log('MongoDb Connected'))
    .catch(err => console.log(err));


app.get('/', authenticateToken, (req, res) => {
    res.json({ 'shop app': 'version 1.0.0' })
});

app.post('/items', authenticateToken, (req, response) => {
    request.get('http://shop-search:4101/items', { json: req.body }, (err, res, body) => {
        if (err) { return console.log(err); }
        response.json(body);
    });
});

app.get('/favorites', authenticateToken, (req, response) => {

    const options = {
        json: true,
        auth: {
            bearer: req.jwt
        }
    };

    request.get('http://shop-favorites:4102/favorites', options, (err, res, body) => {
        if (err) { return console.log(err); }
        response.json(body);
    });
});

app.delete('/favorites/:id', authenticateToken, (req, response) => {
    const id = req.params.id;
    const options = {
        json: true,
        auth: {
            bearer: req.jwt
        }
    };

    request.delete(`http://shop-favorites:4102/favorites/${id}`, options, (err, res, body) => {
        if (err) { return console.log(err); }
        response.json(body);
    });
});

app.post('/favorites', authenticateToken, (req, response) => {
    const options = {
        json: req.body,
        auth: {
            bearer: req.jwt
        }
    };

    request.post('http://shop-favorites:4102/favorites', options, (err, res, body) => {
        if (err) { return console.log(err); }
        response.json(body);
    });
});

app.post('/login', (req, response) => {
    User.findOne({
        username: req.body.username,
        password: toBase64(req.body.password)
    }).then(user => {
        if (user == null) {
            return response.status(400).json({ msg: 'Invalid credentials' })
        }

        return response.json({ authToken: getToken(user) })
    })
});

app.post('/register', (req, response) => {
    User.findOne({
        username: req.body.username,
    }).then(user => {
        if (user == null) {
            const newUser = new User({
                username: req.body.username,
                password: toBase64(req.body.password)
            });
            newUser.save(response.json({ authToken: getToken(newUser) }));
        } else {
            response.status(400).json({ msg: 'username already taken' });
        }
    })
});

function getToken(user) {
    return jwt.sign({ username: user.username, passowrd: user.password }, process.env.ACCESS_TOKEN_SECRET);
}

function authenticateToken(req, response, next) {
    if (!!!req.headers.cookie) {
        return response.sendStatus(401);
    }

    const re = /JWT=[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+/;
    const jwtCookie = req.headers.cookie.match(re);

    if (jwtCookie == null) {
        return response.sendStatus(401);
    }

    const token = jwtCookie[0].split('=')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return response.sendStatus(403);
        req.user = user;
        req.jwt = token;
        next();
    });
}

function toBase64(str) {
    return Buffer.from(str || '', 'utf8').toString('base64')
}

app.listen(port, () => {
    console.log(`shop App is listening at http://localhost:${port}`);
});