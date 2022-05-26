'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const router = express.Router();

router.use(bodyParser.json());

router.get('/', function (req, res) {
    res.render('home');
});

router.post('/user', function (req, res) {
    const data = {jwt: req.body.credential, id:"123"}
    res.render('user', data)
});

module.exports = router;