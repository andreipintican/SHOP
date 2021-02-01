require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const Item = require('./model/Item');

const app = express();
app.use(bodyParser.json());

const port = 4102;

mongoose
    .connect('mongodb://mongo:27017/shop-app', { useNewUrlParser: true })
    .then(() => console.log('MongoDb Connected'))
    .catch(err => console.log(err));

app.get('/', (req, res) => {
    res.json({ 'shop-favorites': 'version 1.0.0' });
});

app.get('/favorites', authenticateToken, (request, response) => {
    const filter = {
        user: request.user.username
    };

    Item.find(filter)
        .then(items => response.json(items))
        .catch(err => response.status(404).json({ msg: 'No items found' }));
});

app.post('/favorites', authenticateToken, (request, response) => {
    const newItem = new Item({
        user: request.user.username,
        title: request.body.title,
        thumbnail: request.body.thumbnail,
        description: request.body.description,
        giveaway_url: request.body.giveaway_url_open
    });

    newItem.save(response.json(newItem));
});

app.delete('/favorites/:id', authenticateToken, (request, response) => {
    const id = request.params.id;
    Item.deleteOne({ _id: id })
        .then(val => response.json(val))
});

function authenticateToken(req, response, next) {
    if (!!!req.headers.authorization) {
        return response.sendStatus(401);
    }

    const re = /Bearer [a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+/;
    const jwtHeader = req.headers.authorization.match(re);

    if (jwtHeader == null) {
        return response.sendStatus(401);
    }

    const token = jwtHeader[0].split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return response.sendStatus(403);
        req.user = user;
        req.jwt = token;
        next();
    });
}

app.listen(port, () => {
    console.log(`shop is listening at http://localhost:${port}`);
});