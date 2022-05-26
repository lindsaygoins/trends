'use strict';

const express = require('express');
const app = express();

// Put this statement near the top of your module
var bodyParser = require('body-parser');


// Put these statements before you define any routes.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', require('./users/login'));

// Workouts
app.use('/api/workouts', require('./workouts/api'));

// Exercises
app.use('/api/exercises', require('./exercises/api'));

// // Redirect root to login
// app.get('/', (req, res) => {
//   res.redirect('/books');
// });

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});