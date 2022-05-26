'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const db = require('../datastore');

const router = express.Router();

router.use(bodyParser.json());

const datastore = db.datastore;

const WORKOUT = "Workout";

// Create a new workout
router.post('/', async function (req, res) {
    // Verify requested data format is supported
    const accepts = req.accepts(["application/json"]);
    if (accepts) {
        // CREATE NEW WORKOUT HERE
        // // Verify the request body is correct
        // if (verifyBody(req, res)) {
        //     // Add exercise to Datastore
        //     const exercise = await addStrengthExercise(req);
        //     // const exercise = addAttributes(req, entity);
        //     res.status(201).send(exercise);
        // }
    } else {
        res.status(406).json({ "Error": "Server only supports 'application/json'"});
    }
});

// Get all workouts
router.get('/', async function (req, res) {
    // Verify requested data format is supported
    const accepts = req.accepts(["application/json"]);
    if (accepts) {
        // GET WORKOUTS HERE
        // // Get exercises from Datastore
        // const exercises = await getExercises(req);
        // res.status(200).send(exercises);
    } else {
        res.status(406).json({ "Error": "Server only supports 'application/json'"});
    } 
});

router.patch('/', function (req, res) {
    res.set('Accept', 'GET, POST');
    res.status(405).end();
});

router.put('/', function (req, res) {
    res.set('Accept', 'GET, POST');
    res.status(405).end();
});

router.delete('/', function (req, res) {
    res.set('Accept', 'GET, POST');
    res.status(405).end();
});

// Get a workout by its ID
router.get('/:workout_id', async function (req, res) {
    // Verify requested data format is supported
    const accepts = req.accepts(["application/json"]);
    if (accepts) {
        // GET WORKOUT HERE
        // // Get exercise from Datastore
        // const exercise = await getExercise(req);
        // if (exercise === undefined || exercise === null) {
        //     res.status(404).json({ "Error": "No exercise with this exercise_id exists" });
        // }
        // res.status(200).send(exercise);
    } else {
        res.status(406).json({ "Error": "Server only supports 'application/json'"});
    }
});

// Edit all attributes of a workout
router.put('/:workout_id', async function (req, res) {
    // Verify requested data format is supported
    const accepts = req.accepts(["application/json"]);
    if (accepts) {
        // GET WORKOUT HERE
        // // Get exercise from Datastore
        // const exercise = await getExercise(req);
        // if (exercise === undefined || exercise === null) {
        //     res.status(404).json({ "Error": "No exercise with this exercise_id exists" });
        
        // EDIT WORKOUT HERE
        // // Verify request body is correct
        // } else if (verifyBody(req, res)) {
        //     // Add exercise to Datastore
        //     const new_exercise = await putExercise(req);
        //     res.status(200).send(new_exercise);
        // }
    } else {
        res.status(406).json({ "Error": "Server only supports 'application/json'"});
    }
});

// Edit some attributes of a workout
router.patch('/:workout_id', async function (req, res) {
    // Verify requested data format is supported
    const accepts = req.accepts(["application/json"]);
    if (accepts) {
        // GET WORKOUT HERE
        // // Get exercise from Datastore
        // const exercise = await getExercise(req);
        // if (exercise === undefined || exercise === null) {
        //     res.status(404).json({ "Error": "No exercise with this exercise_id exists" });
        
        // EDIT WORKOUT HERE
        // // Verify request body is correct
        // } else if (verifyBody(req, res)) {
        //     // Add exercise to Datastore
        //     const new_exercise = await patchExercise(req, exercise);
        //     res.status(200).send(new_exercise);
        // }
    } else {
        res.status(406).json({ "Error": "Server only supports 'application/json'"});
    }
});

// Delete a workout
router.delete('/:workout_id', async function (req, res) {
    // GET WORKOUT HERE
    // // Verify exercise exists
    // const exercise = await getExercise(req);
    // if (exercise === undefined || exercise === null) {
    //     res.status(404).json({ "Error": "No exercise with this exercise_id exists" });
    // } else {

            // DELETE WORKOUT HERE
    //     // Delete exercise
    //     await deleteExercise(req);
    //     res.status(204).end();
    // }
});

router.post('/:workout_id', function (req, res) {
    res.set('Accept', 'GET, PUT, PATCH, DELETE');
    res.status(405).end();
});

module.exports = router;