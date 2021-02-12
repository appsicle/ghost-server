const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');
const userService = require('../services/user.service');
const sessionService = require('../services/session.service');

const { body } = require('express-validator');
const { validate } = require('../middleware/expressValidator.middleware')
const { wrapAsync } = require('../middleware/errorHandler.middleware');
const { StatusCodeError, NoAccessError } = require('../errors');

router.post('/googleSignin',
  validate([
    body("idToken")
      .exists().withMessage("required").bail()
      .isString()
  ]),
  wrapAsync(async (req, res) => {
    const token = req.body.idToken; // TODO: send this over header instead

    console.log('googlesignin', req.body);

    // verify token
    const { sub: googleId } = await authService.verifyToken(token);
    console.log('verify token', googleId);

    // fetch user
    let user;
    user = await userService.retrieveWithGoogleId(googleId);
    if (!user) {
      // TODO: redirect?
      throw new NoAccessError("Please register for an account")
    }

    // attach user to session
    sessionService.attachUser(req.session, user);
    console.log('session attached');

    res.status(200).json({
      name: user.name, 
      profilePic: user.profilePic,
      role: user.role,
    });
  }));

router.post('/googleSignup',
  validate([
    body("idToken")
      .exists().withMessage("required").bail()
      .isString(),
    body("desiredRole")
      .exists().withMessage("required").bail()
      .isIn(["REVIEWER", "REVIEWEE"])
  ]),
  wrapAsync(async (req, res) => {
    const token = req.body.idToken; // TODO: send this over header instead
    const { desiredRole: role, bio, age, ethnicity, location, profilePic } = req.body;

    console.log('googlesignin', JSON.stringify(req.body));

    // verify token
    const { sub: googleId, name, email } = await authService.verifyToken(token);
    console.log('verify token');

    // check for existing user
    let user;
    user = await userService.retrieveWithGoogleId(googleId);
    if (user) {
      // TODO: redirect?
      throw new StatusCodeError(400, "User already has an account")
    }

    // create new user
    user = await userService.createWithGoogle({
      googleId,
      name,
      email,
      role,
      bio,
      age,
      ethnicity,
      location,
      profilePic
    });
    console.log('user created');
    console.log(user);

    // attach user to session
    sessionService.attachUser(req.session, user);
    console.log('session attached');

    res.status(200).json({
      name: user.name, 
      profilePic: user.profilePic,
      role: user.role,
    });
  }));


router.get('/logout',
  wrapAsync(async (req, res) => {
    console.log('logout');

    req.session.destroy()

    res.status(200).send();
  }));

module.exports = router;
