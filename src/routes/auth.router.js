const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');
const userService = require('../services/user.service');
const sessionService = require('../services/session.service');

const { body } = require('express-validator');
const { validate } = require('../middleware/expressValidator.middleware');
const { wrapAsync } = require('../middleware/errorHandler.middleware');

router.post(
  '/googleSignin',
  validate([
    body('idToken').exists().withMessage('required').bail().isString(),
  ]),
  wrapAsync(async (req, res) => {
    const token = req.body.idToken; // TODO: send this over header instead

    console.log('googlesignin', req.body);

    // verify token
    const { sub: googleId } = await authService.verifyToken(token);
    console.log('verify token', googleId);

    // fetch user
    const retrievedUser = await userService.retrieveWithGoogleId(googleId);

    // attach user to session
    sessionService.attachUser(req.session, retrievedUser);
    console.log('session attached');

    res.status(200).json({
      name: retrievedUser.name,
      profilePic: retrievedUser.profilePic,
      role: retrievedUser.role,
    });
  }),
);

router.post(
  '/signin',
  validate([
    body('email').exists().withMessage('required').bail().isEmail(),
    body('password').exists().withMessage('required').bail().isString(), // TODO: .isStrongPassword()
  ]),
  wrapAsync(async (req, res) => {
    const { email, password } = req.body;

    console.log('signin with email');

    // fetch user
    const retrievedUser = await userService.retrieveWithEmailPassword(
      email,
      password,
    );

    // attach user to session
    sessionService.attachUser(req.session, retrievedUser);
    console.log('session attached');

    res.status(200).json({
      name: retrievedUser.name,
      profilePic: retrievedUser.profilePic,
      role: retrievedUser.role,
    });
  }),
);

router.post(
  '/signup',
  validate([
    body('name').exists().withMessage('required').bail().isString(),
    body('email').exists().withMessage('required').bail().isEmail(),
    body('password').exists().withMessage('required').bail().isString(), // TODO: .isStrongPassword()
    body('desiredRole')
      .exists()
      .withMessage('required')
      .bail()
      .isIn(['REVIEWER', 'REVIEWEE']),
  ]),
  wrapAsync(async (req, res) => {
    const {
      name,
      email,
      password,
      desiredRole: role,
      bio,
      age,
      ethnicity,
      location,
      profilePic,
    } = req.body;

    console.log('signup with email', JSON.stringify(req.body));

    // create new user
    const newUser = await userService.createWithEmailPassword(
      password,
      name,
      email,
      role,
      bio,
      age,
      ethnicity,
      location,
      profilePic,
    );

    // attach user to session
    sessionService.attachUser(req.session, newUser);
    console.log('session attached');

    res.status(200).json({
      name: newUser.name,
      profilePic: newUser.profilePic,
      role: newUser.role,
    });
  }),
);

router.post(
  '/googleSignup',
  validate([
    body('idToken').exists().withMessage('required').bail().isString(),
    body('desiredRole')
      .exists()
      .withMessage('required')
      .bail()
      .isIn(['REVIEWER', 'REVIEWEE']),
  ]),
  wrapAsync(async (req, res) => {
    const token = req.body.idToken; // TODO: send this over header instead
    const {
      desiredRole: role,
      bio,
      age,
      ethnicity,
      location,
      profilePic,
    } = req.body;

    console.log('googlesignin', JSON.stringify(req.body));

    // verify token
    const { sub: googleId, name, email } = await authService.verifyToken(token);
    console.log('verify token');

    // create new user
    const newUser = await userService.createWithGoogle(
      googleId,
      name,
      email,
      role,
      bio,
      age,
      ethnicity,
      location,
      profilePic,
    );

    // attach user to session
    sessionService.attachUser(req.session, newUser);
    console.log('session attached');

    res.status(200).json({
      name: newUser.name,
      profilePic: newUser.profilePic,
      role: newUser.role,
    });
  }),
);

router.get(
  '/logout',
  wrapAsync(async (req, res) => {
    console.log('logout');

    req.session.destroy();

    res.status(200).send();
  }),
);

module.exports = router;
