'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const router = express.Router();

router.use(bodyParser.json());

const CLIENT_ID = "1032047830318-3uh58rtmdlaidbo4dqerrvpbmvkgaaee.apps.googleusercontent.com";

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);
async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}


router.get('/', function (req, res) {
    res.render('home');
});

router.post('/user', async function (req, res) {
    const payload = await verify(req.body.credential).catch(console.error);
    const user_id = payload.sub
    const data = {  jwt: req.body.credential, 
                    id: user_id
                 }
    res.render('user', data)
});

module.exports = router;