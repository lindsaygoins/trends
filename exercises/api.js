'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const db = require('../datastore');

const router = express.Router();

router.use(bodyParser.json());

const datastore = db.datastore;

const EXERCISE = "Exercise";


function verifyBody(req, res) {
    // Verify that request is in JSON format
    if (req.get("content-type") !== "application/json") {
        res.status(415).json({ "Error": "Server only accepts application/json data"});
        return false;
    }

    else if (req.method === "POST" || req.method === "PUT") {
        // Verify that all attributes are present
        if (req.body.name === undefined || req.body.weight === undefined || req.body.sets === undefined || req.body.reps === undefined) {
            res.status(400).json({ "Error": "The request object is missing at least one of the required attributes" });

        // Verify that there aren't extra attributes
        } else if (Object.keys(req.body).length > 4) {
            res.status(400).json({ "Error": "The request object has extraneous attributes" });
        
        // Verify that name attribute is a string
        } else if (typeof(req.body.name) !== "string") {
            res.status(400).json({ "Error": "Invalid data type for name attribute, expected string" });
        
        // Verify that weight attribute is a number
        } else if (typeof(req.body.weight) !== "number") {
            res.status(400).json({ "Error": "Invalid data type for weight attribute, expected number" });
        
        // Verify that sets attribute is a number
        } else if (typeof(req.body.sets) !== "number") {
            res.status(400).json({ "Error": "Invalid data type for sets attribute, expected number" });
            
        // Verify that reps attribute is a number
        } else if (typeof(req.body.reps) !== "number") {
            res.status(400).json({ "Error": "Invalid data type for reps attribute, expected number" });
        
        // Check each attribute's content
        } else if (verifyName(req.body.name, res) && verifyWeight(req.body.weight, res) && verifySets(req.body.sets, res) && verifyReps(req.body.reps, res)) {
            return true; 
        }
        return false;
    } 

    else if (req.method === "PATCH") {
        let count_attr = 0

        // Check if name attribute is specified
        if (req.body.name !== undefined) {
            count_attr += 1;
            // Verify that name attribute is a string
            if (typeof(req.body.name) !== "string") {
                res.status(400).json({ "Error": "Invalid data type for name attribute, expected string" });
                return false;
            // Verify the attribute's content
            } else if (!verifyName(req.body.name, res)) {
                return false;
            }
        } 
        
        // Check if weight attribute is specified
        if (req.body.weight !== undefined) {
            count_attr += 1;
            // Verify that weight attribute is a number
            if (typeof(req.body.weight) !== "number") {
                res.status(400).json({ "Error": "Invalid data type for weight attribute, expected number" });
                return false;
            // Verify the attribute's content
            } else if (!verifyWeight(req.body.weight, res)) {
                return false;
            }
        } 
        
        // Check if sets attribute is specified
        if (req.body.sets !== undefined) {
            count_attr += 1;
            // Verify that sets attribute is a number
            if (typeof(req.body.sets) !== "number") {
                res.status(400).json({ "Error": "Invalid data type for sets attribute, expected number" });
                return false;
            // Verify the attribute's content
            } else if (!verifySets(req.body.sets, res)) {
                return false;
            }
        }

        // Check if reps attribute is specified
        if (req.body.reps !== undefined) {
            count_attr += 1;
            // Verify that reps attribute is a number
            if (typeof(req.body.reps) !== "number") {
                res.status(400).json({ "Error": "Invalid data type for reps attribute, expected number" });
                return false;
            // Verify the attribute's content
            } else if (!verifyReps(req.body.reps, res)) {
                return false;
            }
        }

        // Verify that there aren't extra attributes
        if (Object.keys(req.body).length > count_attr) {
            res.status(400).json({ "Error": "The request object has extraneous attributes" });
            return false;
        }
        return true;
    }
}

function verifyName(str, res) { 
    // Check if number of string characters is between 1 and 49 characters
    if (1 > str.length || str.length > 49) {
        res.status(400).json({ "Error": "Name attribute can only be between 1 and 49 characters" });
        return false;
    }

    // Check if the string only contains alphanumeric characters + space characters
    else {
        for (let i = 0; i < str.length; i++) {
            let char = str.charCodeAt(i);
            if (!(char > 47 && char < 58) && !(char > 64 && char < 91) && !(char > 96 && char < 123) && !(char === 32)) {
                res.status(400).json({ "Error": "Name attribute can only contain alphanumeric and space characters" });
                return false;
            }
        }
        return true;
    }
}

function verifyWeight(weight, res) {
    // Check if weight is between 0 and 300
    if (weight >= 0 && weight <= 300) {
        return true;
    } else {
        res.status(400).json({ "Error": "Weight attribute can only be between 0 and 300" });
        return false;
    }
}

function verifySets(sets, res) {
    // Check if sets are between 1 and 10
    if (sets >= 1 && sets <= 10) {
        return true;
    } else {
        res.status(400).json({ "Error": "Sets attribute can only be between 1 and 10" });
        return false;
    }
}

function verifyReps(reps, res) {
    // Check if reps are between 1 and 100
    if (reps >= 1 && reps <= 100) {
        return true;
    } else {
        res.status(400).json({ "Error": "Reps attribute can only be between 1 and 100" });
        return false;
    }
}

// Adds a strength exercise to Datastore
async function addStrengthExercise(req) {
    // Create key and store data
    const key = datastore.key(EXERCISE);
    const entity = {
      key: key,
      data: { 'name': req.body.name,
              'weight': req.body.weight,
              'sets': req.body.sets,
              'reps': req.body.reps,
              'workouts': []
            }
    };
    
    try {
        // Save exercise to Datastore
        await datastore.save(entity);
        entity.data.id = key.id;
        entity.data.self = req.protocol + "://" + req.get('host') + req.baseUrl + '/' + key.id;
        return entity.data;
    } catch (err) {
        console.error('ERROR:', err);
    }
}

// Add cardio functionality later
// async function addCardioExercise(body) {
//     const key = datastore.key(EXERCISE);
//     const entity = {
//       key: key,
//       data: { 'name': body.name,
//               'distance': body.distance
//       }
//     };
  
//     try {
//       await datastore.save(entity);
//       console.log(`Exercise ${key.id} created successfully.`);
//       return entity;
//     } catch (err) {
//       console.error('ERROR:', err);
//     }
// }

// Get all exercises from Datastore
async function getExercises(req){
    try {
        // Get total number of exercises in collection
        const length_query = datastore.createQuery(EXERCISE);
        const all_entities = await datastore.runQuery(length_query);
        const length = all_entities[0].length;
        const results = {num_total_items: length};

        var query = datastore.createQuery(EXERCISE).limit(5);

        // Set starting cursor if one exists
        if(Object.keys(req.query).includes("cursor")){
            query = query.start(req.query.cursor);
        }

        // Get 5 exercises from the collection
        const entities = await datastore.runQuery(query);
        results.items = entities[0].map(db.fromDatastore);
        
        // Generate next link if there are more results
        if (entities[1].moreResults !== db.Datastore.NO_MORE_RESULTS ) {
            results.next = req.protocol + "://" + req.get("host") + req.baseUrl + "?cursor=" + entities[1].endCursor;
        }

        return results;
    } catch (err) {
        console.error('ERROR:', err);
    } 
}

// Get a single exercise from Datastore
async function getExercise(req){
    // Get key from ID and get exercise from Datastore
    const key = datastore.key([EXERCISE, parseInt(req.params.exercise_id, 10)]);
    try {
        const entity = await datastore.get(key);
        // If there is no entity associated with this ID
        if (entity[0] === undefined || entity[0] === null) {
            return entity[0];
        } else  {
            // Create results object with self url and id
            const exercise = entity[0];
            exercise.id = req.params.exercise_id;
            exercise.self = req.protocol + "://" + req.get('host') + req.baseUrl + '/' + req.params.exercise_id;
            return exercise;
        }
    } catch (err) {
        console.error('ERROR:', err);
    }
    return;
}

// Edit all attributes of an exercise in Datastore
async function putExercise(req, exercise) {
    // Get key from ID and create exercise with new attributes
    const key = datastore.key([EXERCISE, parseInt(req.params.exercise_id, 10)]);
    try {
        const data = req.body;
        data.workouts = exercise.workouts;
        await datastore.save({ "key": key, "data": data });
        // Create results object with self url and id
        const results = req.body;
        results.self = req.protocol + "://" + req.get('host') + req.baseUrl + '/' + req.params.exercise_id;
        results.id = req.params.exercise_id
        return results;
    } catch (err) {
        console.error('ERROR:', err);
    }
}

// Edit some attributes of an exercise in Datastore
async function patchExercise(req, exercise) {
    try {
        // Get key from ID
        const key = datastore.key([EXERCISE, parseInt(req.params.exercise_id, 10)]);

        // If a new attribute is specified, replace old attribute
        if (req.body.name !== undefined) {
            exercise.name = req.body.name;
        }
        if (req.body.weight !== undefined) {
            exercise.weight = req.body.weight;
        }
        if (req.body.sets !== undefined) {
            exercise.sets = req.body.sets;
        }
        if (req.body.reps !== undefined) {
            exercise.reps = req.body.reps;
        }

        // Save updates to exercise and add self url + id to exercise object
        await datastore.save({ "key": key, "data": exercise })
        exercise.self = req.protocol + "://" + req.get('host') + req.baseUrl + '/' + req.params.exercise_id;
        exercise.id = req.params.exercise_id;
        return exercise;

    } catch (err) {
        console.error('ERROR:', err);
    }
}

// Delete an exercise from Datastore
async function deleteExercise(req) {
    try {
        // Get key from ID
        const key = datastore.key([EXERCISE, parseInt(req.params.exercise_id, 10)]);
        datastore.delete(key);
    } catch (err) {
        console.error('ERROR:', err);
    } 
}

// Create a new exercise
router.post('/', async function (req, res) {
    // Verify requested data format is supported
    const accepts = req.accepts(["application/json"]);
    if (accepts) {
        // Verify the request body is correct
        if (verifyBody(req, res)) {
            // Add exercise to Datastore
            const exercise = await addStrengthExercise(req);
            // const exercise = addAttributes(req, entity);
            res.status(201).send(exercise);
        }
    } else {
        res.status(406).json({ "Error": "Server only supports 'application/json'"});
    }
});

// Get all exercises
router.get('/', async function (req, res) {
    // Verify requested data format is supported
    const accepts = req.accepts(["application/json"]);
    if (accepts) {
        // Get exercises from Datastore
        const exercises = await getExercises(req);
        res.status(200).send(exercises);
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

// Get an exercise by its ID
router.get('/:exercise_id', async function (req, res) {
    // Verify requested data format is supported
    const accepts = req.accepts(["application/json"]);
    if (accepts) {
        // Get exercise from Datastore
        const exercise = await getExercise(req);
        if (exercise === undefined || exercise === null) {
            res.status(404).json({ "Error": "No exercise with this exercise_id exists" });
        }
        res.status(200).send(exercise);
    } else {
        res.status(406).json({ "Error": "Server only supports 'application/json'"});
    }
});

// Edit all attributes of an exercise
router.put('/:exercise_id', async function (req, res) {
    // Verify requested data format is supported
    const accepts = req.accepts(["application/json"]);
    if (accepts) {
        // Get exercise from Datastore
        const exercise = await getExercise(req);
        if (exercise === undefined || exercise === null) {
            res.status(404).json({ "Error": "No exercise with this exercise_id exists" });
        
        // Verify request body is correct
        } else if (verifyBody(req, res)) {
            // Add exercise to Datastore
            const new_exercise = await putExercise(req, exercise);
            res.status(200).send(new_exercise);
        }
    } else {
        res.status(406).json({ "Error": "Server only supports 'application/json'"});
    }
});

// Edit some attributes of an exercise
router.patch('/:exercise_id', async function (req, res) {
    // Verify requested data format is supported
    const accepts = req.accepts(["application/json"]);
    if (accepts) {
        // Get exercise from Datastore
        const exercise = await getExercise(req);
        if (exercise === undefined || exercise === null) {
            res.status(404).json({ "Error": "No exercise with this exercise_id exists" });
        
        // Verify request body is correct
        } else if (verifyBody(req, res)) {
            // Add exercise to Datastore
            const new_exercise = await patchExercise(req, exercise);
            res.status(200).send(new_exercise);
        }
    } else {
        res.status(406).json({ "Error": "Server only supports 'application/json'"});
    }
});

// Delete an exercise
router.delete('/:exercise_id', async function (req, res) {
    // Verify exercise exists
    const exercise = await getExercise(req);
    if (exercise === undefined || exercise === null) {
        res.status(404).json({ "Error": "No exercise with this exercise_id exists" });
    } else {
        // Delete exercise
        await deleteExercise(req);
        res.status(204).end();
    }
});

router.post('/:exercise_id', function (req, res) {
    res.set('Accept', 'GET, PUT, PATCH, DELETE');
    res.status(405).end();
});

module.exports = {
    router:router,
    getExercise:getExercise
};