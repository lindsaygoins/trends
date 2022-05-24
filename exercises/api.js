'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const db = require('../datastore');

const router = express.Router();

router.use(bodyParser.json());

const datastore = db.datastore;

const EXERCISE = "Exercise";

function generate_self_url(req, entity) {
    // Generate self URL
    return req.protocol + "://" + req.get('host') + req.baseUrl + '/' + entity.key.id;
}

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

    // else if (req.method === "PATCH") {
    //     let count_attr = 0

    //     // Check if name attribute is specified
    //     if (req.body.name !== undefined) {
    //         count_attr += 1;
    //         // Verify that name attribute is a string
    //         if (typeof(req.body.name) !== "string") {
    //             res.status(400).json({ "Error": "Invalid data type for name attribute, expected string" });
    //             return false;
    //         // Verify the attribute's content
    //         } else if (!verify_string(req.body.name, "Name", res)) {
    //             return false;
    //         }
    //     } 
        
    //     // Check if type attribute is specified
    //     if (req.body.type !== undefined) {
    //         count_attr += 1;
    //         // Verify that type attribute is a string
    //         if (typeof(req.body.type) !== "string") {
    //             res.status(400).json({ "Error": "Invalid data type for type attribute, expected string" });
    //             return false;
    //         // Verify the attribute's content
    //         } else if (!verify_string(req.body.type, "Type", res)) {
    //             return false;
    //         }
    //     } 
        
    //     // Check if length attribute is specified
    //     if (req.body.length !== undefined) {
    //         count_attr += 1;
    //         // Verify that length attribute is a number
    //         if (typeof(req.body.length) !== "number") {
    //             res.status(400).json({ "Error": "Invalid data type for length attribute, expected number" });
    //             return false;
    //         // Verify the attribute's content
    //         } else if (!verify_number(req.body.length, res)) {
    //             return false;
    //         }
    //     }

    //     // Verify that there aren't extra attributes
    //     if (Object.keys(req.body).length > count_attr) {
    //         res.status(400).json({ "Error": "The request object has extraneous attributes" });
    //         return false;
    //     }
    //     return true;
    // }
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
async function addStrengthExercise(body) {
    const key = datastore.key(EXERCISE);
    const entity = {
      key: key,
      data: { 'name': body.name,
              'weight': body.weight,
              'sets': body.sets,
              'reps': body.reps,
              'workouts': []
      }
    };
  
    try {
      await datastore.save(entity);
      console.log(`Exercise ${key.id} created successfully.`);
      return entity;
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
function getExercises(req){
    var q = datastore.createQuery(EXERCISE).limit(5);
    const results = {};
    // Set starting cursor if one exists
    if(Object.keys(req.query).includes("cursor")){
        q = q.start(req.query.cursor);
    }
    // Get all exercises
	return datastore.runQuery(q).then( (entities) => {
            // // Add id attribute to each exercise in array
            // results.items = entities[0].map(db.fromDatastore);
            // // If there are more results, generate cursor link
            // if(entities[1].moreResults !== db.Datastore.NO_MORE_RESULTS ){
            //     results.next = req.protocol + "://" + req.get("host") + req.baseUrl + "?cursor=" + entities[1].endCursor;
            // }
			// return results;
            return entities;
		});
}

function addAttributes(req, entity) {
    const exercise = entity.data;
    exercise.id = entity.key.id;
    exercise.self = generate_self_url(req, entity);
    return exercise;
}

router.post('/', async (req, res) => {
    // Verify the request body is correct
    if (verifyBody(req, res)) {
        // Add exercise to Datastore
        const entity = await addStrengthExercise(req.body);
        const exercise = addAttributes(req, entity);
        res.status(201).send(exercise);
    }
});

router.get('/', async (req, res) => {
    const exercises = await getExercises(req);
    res.status(200).send(exercises);
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

module.exports = router;