const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');
const userService = require('../services/user.service');
const sessionService = require('../services/session.service');

router.post('/googleSignin', async (req, res) => {
  const token = req.body.idToken; // TODO: send this over header instead

  console.log("googlesignin", req.body)

  // verify token
  const { sub: googleId, name, email } = await authService.verifyToken(token);
  console.log("verify token", googleId)

  // fetch user
  let user;
  const { retrievedUser, err } = await userService.retrieveWithGoogleId(
    googleId,
  );
  if (err) {
    res.status(500).json({ err: `failed to fetch user: ${err}` });
  }else{
    console.log("user found")
  }
  user = retrievedUser;

  // create user if DNE
  if (!retrievedUser) {
    const { retrievedUser, err } = userService.createWithGoogle({
      googleId,
      name,
      email,
    });
    if (err) {
      res.status(500).json({ err: `failed to create user: ${err}` });
    }else{
      console.log("user created")
    }
    user = retrievedUser;
  }

  // attach user to session
  sessionService.attachUser(req.session, user);
  console.log("session attached")

  res.status(200).json("lgtm");
});

module.exports = router;
