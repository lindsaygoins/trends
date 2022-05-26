'use strict';

const express = require('express');
const app = express();

const { engine } = require ('express-handlebars');

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set("views", "./views");

var path = require('path');

app.use(express.static(path.join(__dirname, '/public')));

var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Users
app.use('/', require('./users/login'));

// Exercises
app.use('/api/exercises', require('./exercises/api'));

// Workouts
app.use('/api/workouts', require('./workouts/api'));

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});