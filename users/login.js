'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const db = require('../datastore');

const router = express.Router();

router.use(bodyParser.json());

const datastore = db.datastore;

const USER = "User";

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

// Saves a new user to Datastore
async function createUser(user_data) {
    // Create key and store data
    const key = datastore.key(USER);
    const entity = {
      key: key,
      data: { 'firstname': user_data.given_name,
              'lastname': user_data.family_name,
              'email': user_data.email,
              'user_id': user_data.sub,
            }
    };
    
    try {
        // Save user to Datastore
        await datastore.save(entity);
    } catch (err) {
        console.error('ERROR:', err);
    }
}

// Gets a user from Datastore
async function getUser(user_id) {
    // Find a user based on their unique ID
    const query = datastore.createQuery(USER).filter('user_id', '=', user_id);
    const entity = await datastore.runQuery(query);
    return entity[0];
}

// Login page
router.get('/', function (req, res) {
    res.render('home');
});

// Listens for JWT from Google
router.post('/', async function (req, res) {
    // Verify JWT
    const payload = await verify(req.body.credential).catch(console.error);
    const user_id = payload.sub;

    // See if user account exists, if not, create a user
    const user = await getUser(user_id);
    console.log(user)
    if (user === undefined || user === null || user.length == 0) {
        await createUser(payload);
    }

    // Display JWT and unique ID
    const data = {  jwt: req.body.credential, 
                    id: user_id
                 }
    res.render('user', data)
});

module.exports = router;