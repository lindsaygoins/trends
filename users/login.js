'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const router = express.Router();

router.use(bodyParser.json());

router.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/login.html'));
});

router.post('/user', function (req, res) {
    console.log(req.body.credential)
    res.json(req.body);
});

module.exports = router;