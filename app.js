'use strict';

const express = require('express');
const app = express();

// Workouts
// app.use('/api/workouts', require('./workouts/api'));

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