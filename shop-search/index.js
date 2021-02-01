const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const port = 4101;

app.get('/', (req, res) => {
    res.json({ 'shop-search': 'version 1.0.0' });
});

app.get('/items', (req, response) => {
    const filter = {};
    Object.entries(req.body)
        .filter(e => e[1] !== '')
        .forEach(e => filter[e[0]] = e[1]);

    console.log(filter);
    request.get('https://www.gamerpower.com/api/giveaways', { qs: filter, json: true }, (err, res, body) => {
        if (err) { return console.log(err); }
        response.json(body);
    });
});

app.listen(port, () => {
    console.log(`shop Search is listening at http://localhost:${port}`);
});