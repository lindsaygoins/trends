'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const db = require('../datastore');

const router = express.Router();

router.use(bodyParser.json());

const validateDate = require("validate-date");

const datastore = db.datastore;

const WORKOUT = "Workout";

const CLIENT_ID = "1032047830318-3uh58rtmdlaidbo4dqerrvpbmvkgaaee.apps.googleusercontent.com";

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// Verifies JWT
async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}

// Parses JWT from Authorization header
function parseJWT(token) {
    const parsed = token.split(' ');
    const jwt = parsed[1];
    return jwt;
}

function verifyBody(req, res) {
    // Verify that request is in JSON format
    if (req.get("content-type") !== "application/json") {
        res.status(415).json({ "Error": "Server only accepts application/json data"});
        return false;
    }

    else if (req.method === "POST" || req.method === "PUT") {
        // Verify that all attributes are present
        if (req.body.length === undefined || req.body.heartrate === undefined || req.body.date === undefined) {
            res.status(400).json({ "Error": "The request object is missing at least one of the required attributes" });

        // Verify that there aren't extra attributes
        } else if (Object.keys(req.body).length > 3) {
            res.status(400).json({ "Error": "The request object has extraneous attributes" });
        
        // Verify that length attribute is a number
        } else if (typeof(req.body.length) !== "number") {
            res.status(400).json({ "Error": "Invalid data type for length attribute, expected number" });
        
        // Verify that heartrate attribute is a number
        } else if (typeof(req.body.heartrate) !== "number") {
            res.status(400).json({ "Error": "Invalid data type for heartrate attribute, expected number" });
        
        // Verify that date attribute is a string
        } else if (typeof(req.body.date) !== "string") {
            res.status(400).json({ "Error": "Invalid data type for date attribute, expected string" });
            
        // Check each attribute's content
        } else if (verifyLength(req.body.length, res) && verifyHeartrate(req.body.heartrate, res) && verifyDate(req.body.date, res)) {
            return true; 
        }
        return false;
    } 

    else if (req.method === "PATCH") {
        let count_attr = 0

        // Check if length attribute is specified
        if (req.body.length !== undefined) {
            count_attr += 1;
            // Verify that length attribute is a number
            if (typeof(req.body.length) !== "number") {
                res.status(400).json({ "Error": "Invalid data type for length attribute, expected number" });
                return false;
            // Verify the attribute's content
            } else if (!verifyLength(req.body.length, res)) {
                return false;
            }
        } 
        
        // Check if heartrate attribute is specified
        if (req.body.heartrate !== undefined) {
            count_attr += 1;
            // Verify that heartrate attribute is a number
            if (typeof(req.body.heartrate) !== "number") {
                res.status(400).json({ "Error": "Invalid data type for heartrate attribute, expected number" });
                return false;
            // Verify the attribute's content
            } else if (!verifyHeartrate(req.body.heartrate, res)) {
                return false;
            }
        } 
        
        // Check if date attribute is specified
        if (req.body.date !== undefined) {
            count_attr += 1;
            // Verify that date attribute is a string
            if (typeof(req.body.date) !== "string") {
                res.status(400).json({ "Error": "Invalid data type for date attribute, expected string" });
                return false;
            // Verify the attribute's content
            } else if (!verifyDate(req.body.date, res)) {
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

function verifyLength(length, res) {
    // Check if length is between 1 and 1440
    if (length >= 1 && length <= 1440) {
        return true;
    } else {
        res.status(400).json({ "Error": "Length attribute can only be between 1 and 1440" });
        return false;
    }
}

function verifyHeartrate(heartrate, res) {
    // Check if heartrate is between 30 and 220
    if (heartrate >= 30 && heartrate <= 220) {
        return true;
    } else {
        res.status(400).json({ "Error": "Heartrate attribute can only be between 30 and 220" });
        return false;
    }
}

// function parseDate(date) {
//     const parsed_date = date.split('/');
//     if (parsed_date.length === 3) {
//         const day_str = parsed_date[0];
//         const month_str = parsed_date[1];
//         const year_str = parsed_date[2];

//         const day = parseInt(day_str);
//         const month = parseInt(month_str);
//         const year = parseInt(year_str);
        
//         if (!isNaN(day) && !isNaN(month) && !isNaN(year) && day > 0 && day < 32 && month > 0 && month < 13 && year > 1900 && year < 2030) {
//             return [day, month, year];

//         }
//     }
//     res.status(400).json({"Error": "Incorrect date format"});
//     return false;
// }

function verifyDate(date, res) {
    // Check if date is a valid date
    if (validateDate(date, "boolean", "dd/mm/yyyy")) {
        return true;
    } else {
        res.status(400).json({"Error": "Incorrect date format"});
        return false;
    }
}

// Adds a workout to Datastore
async function addWorkout(req, jwt_data) {
    // Create key and store data
    const key = datastore.key(WORKOUT);
    const entity = {
      key: key,
      data: { 'length': req.body.length,
              'heartrate': req.body.heartrate,
              'date': req.body.date,
              'owner': jwt_data.sub,
              'exercises': []
            }
    };
    
    try {
        // Save workout to Datastore
        await datastore.save(entity);
        entity.data.id = key.id;
        entity.data.self = req.protocol + "://" + req.get('host') + req.baseUrl + '/' + key.id;
        return entity.data;
    } catch (err) {
        console.error('ERROR:', err);
    }
}

// Get all workouts from Datastore
async function getWorkouts(req, jwt_data){
    try {
        // Get total number of workouts in collection
        const length_query = datastore.createQuery(WORKOUT).filter('owner', '=', jwt_data.sub);
        const all_entities = await datastore.runQuery(length_query);
        const length = all_entities[0].length;
        const results = {num_total_items: length};

        var query = datastore.createQuery(WORKOUT).filter('owner', '=', jwt_data.sub).limit(5);

        // Set starting cursor if one exists
        if(Object.keys(req.query).includes("cursor")){
            query = query.start(req.query.cursor);
        }

        // Get 5 workouts from the collection
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

// Get a single workout from Datastore
async function getWorkout(req){
    // Get key from ID and get workout from Datastore
    const key = datastore.key([WORKOUT, parseInt(req.params.workout_id, 10)]);
    try {
        const entity = await datastore.get(key);
        // If there is no entity associated with this ID
        if (entity[0] === undefined || entity[0] === null) {
            return entity[0];
        } else  {
            // Create results object with self url and id
            const exercise = entity[0];
            exercise.id = req.params.workout_id;
            exercise.self = req.protocol + "://" + req.get('host') + req.baseUrl + '/' + req.params.workout_id;
            return exercise;
        }
    } catch (err) {
        console.error('ERROR:', err);
    } 
}

// Edit all attributes of a workout in Datastore
async function putWorkout(req, workout) {
    // Get key from ID and create workout with new attributes
    const key = datastore.key([WORKOUT, parseInt(req.params.workout_id, 10)]);
    try {
        const data = req.body;
        data.exercises = workout.exercises;
        data.owner = workout.owner;
        await datastore.save({ "key": key, "data": data });
        // Create results object with self url and id
        const results = req.body;
        results.self = req.protocol + "://" + req.get('host') + req.baseUrl + '/' + req.params.workout_id;
        results.id = req.params.workout_id
        return results;
    } catch (err) {
        console.error('ERROR:', err);
    }
}

// Create a new workout
router.post('/', async function (req, res) {
    // Verify requested data format is supported
    const accepts = req.accepts(["application/json"]);
    if (accepts) {
        // Verify that valid JWT was provided
        if (req.headers.authorization !== undefined) {
            const jwt = parseJWT(req.headers.authorization);
            const jwt_data = await verify(jwt).catch(console.error);
            
            if (jwt_data === undefined || jwt_data === null) {
                res.status(400).json({"Error": "Invalid JWT"});
            
            // Verify the body of the request
            } else if (verifyBody(req, res)) {
                // Save the workout to Datastore
                const workout = await addWorkout(req, jwt_data);
                res.status(201).send(workout);
            }    
        } else {
            res.status(401).json({"Error": "Unauthenticated"});
        }
    } else {
        res.status(406).json({ "Error": "Server only supports 'application/json'"});
    }
});

// Get all workouts
router.get('/', async function (req, res) {
    // Verify requested data format is supported
    const accepts = req.accepts(["application/json"]);
    if (accepts) {
        // Verify that valid JWT was provided
        if (req.headers.authorization !== undefined) {
            const jwt = parseJWT(req.headers.authorization);
            const jwt_data = await verify(jwt).catch(console.error);
            
            if (jwt_data === undefined || jwt_data === null) {
                res.status(400).json({"Error": "Invalid JWT"});
            
            } else {
                // Get workouts from Datastore
                const workouts = await getWorkouts(req, jwt_data);
                res.status(200).send(workouts);
            }    
        } else {
            res.status(401).json({"Error": "Unauthenticated"});
        }
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
        // Verify that valid JWT was provided
        if (req.headers.authorization !== undefined) {
            const jwt = parseJWT(req.headers.authorization);
            const jwt_data = await verify(jwt).catch(console.error);
            
            if (jwt_data === undefined || jwt_data === null) {
                res.status(400).json({"Error": "Invalid JWT"});
            
            } else {
                // Get workout from Datastore
                const workout = await getWorkout(req);
                if (workout === undefined || workout === null) {
                    res.status(404).json({ "Error": "No workout with this workout_id exists" });
                
                // Verify user is authorized to access this workout
                } else if (workout.owner !== jwt_data.sub) {
                    res.status(403).json({"Error": "Unauthorized"});
                } else {
                    res.status(200).send(workout);
                }
            }    
        } else {
            res.status(401).json({"Error": "Unauthenticated"});
        }
    } else {
        res.status(406).json({ "Error": "Server only supports 'application/json'"});
    }
});

// Edit all attributes of a workout
router.put('/:workout_id', async function (req, res) {
    // Verify requested data format is supported
    const accepts = req.accepts(["application/json"]);
    if (accepts) {
        // Verify that valid JWT was provided
        if (req.headers.authorization !== undefined) {
            const jwt = parseJWT(req.headers.authorization);
            const jwt_data = await verify(jwt).catch(console.error);
            
            if (jwt_data === undefined || jwt_data === null) {
                res.status(400).json({"Error": "Invalid JWT"});
            
            } else {
                // Get workout from Datastore
                const workout = await getWorkout(req);
                if (workout === undefined || workout === null) {
                    res.status(404).json({ "Error": "No workout with this workout_id exists" });
                
                // Verify user is authorized to access this workout
                } else if (workout.owner !== jwt_data.sub) {
                    res.status(403).json({"Error": "Unauthorized"});
                
                // Verify the body of the request
                } else if (verifyBody(req, res)) {
                    // Save the workout to Datastore
                    const new_workout = await putWorkout(req, workout);
                    res.status(200).send(new_workout);
                }
            }    
        } else {
            res.status(401).json({"Error": "Unauthenticated"});
        }
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