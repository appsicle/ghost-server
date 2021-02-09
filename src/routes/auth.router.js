const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');
const userService = require('../services/user.service');
const sessionService = require('../services/session.service');

router.post('/googleSignin', async (req, res) => {
  const token = req.body.idToken; // TODO: send this over header instead

  console.log('googlesignin', req.body);

  // verify token
  const { sub: googleId, name, email } = await authService.verifyToken(token);
  console.log('verify token', googleId);

  // fetch user
  let user;
  const { retrievedUser, err } = await userService.retrieveWithGoogleId(
    googleId,
  );

  if (err) {
    res.status(500).json({ err: `failed to fetch user: ${err}` });
  } else {
    console.log('user found');
  }
  user = retrievedUser;

  if (!retrievedUser) {
    res.status(500).json({ err: `user does not exist: ${err}` });
  }

  // attach user to session
  sessionService.attachUser(req.session, user);
  console.log('session attached');

  res.status(200).json({
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

router.post('/googleSignup', async (req, res) => {
  const token = req.body.idToken; // TODO: send this over header instead
  const role = req.body.desiredRole;

  console.log('googlesignin', req.body);

  // verify token
  const { sub: googleId, name, email } = await authService.verifyToken(token);
  console.log('verify token', googleId);

  // fetch user
  let user;
  const { retrievedUser, err } = await userService.retrieveWithGoogleId(
    googleId,
  );
  if (err) {
    res.status(500).json({ err: `failed to fetch user: ${err}` });
  } else {
    console.log('user found');
  }

  // create user if DNE
  if (retrievedUser) {
    res.status(500).json({ err: `user already exists: ${err}` });
  } else {
    const { user, err } = userService.createWithGoogle({
      googleId,
      name,
      email,
      role,
    });
    if (err) {
      res.status(500).json({ err: `failed to create user: ${err}` });
    } else {
      console.log('user created');
      console.log(user);
      res.status(200).json({
        // name: user.name, // what is user here?
        // email: user.email,
        role: user.role,
      });
    }
  }

  // attach user to session
  sessionService.attachUser(req.session, user);
  console.log('session attached');
});

module.exports = router;
