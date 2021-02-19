var express = require('express');
var router = express.Router();
const UserService = require('../services/user.service');

const { wrapAsync } = require('../middleware/errorHandler.middleware');
const { body, custom } = require('express-validator');
const {
  validate,
  isObjectId,
} = require('../middleware/expressValidator.middleware');

const { isLoggedIn } = require('../middleware/auth.middleware');

router.post(
  '/retrieve',
  isLoggedIn,
  validate([
    body('userId').exists().withMessage('required').bail().custom(isObjectId),
  ]),
  wrapAsync(async (req, res) => {
    const { userId } = req.body;

    console.log(
      `Endpoint: "user/retrieve", recieved: ${JSON.stringify(req.body)}`,
    );

    const retrievedUser = await UserService.retrieve(userId);
    //TODO: dne considered an error?

    return res.json({ retrievedUser });
  }),
);

router.get('/getProfile', isLoggedIn, (req, res) => {
  if (!req.session.user) {
    console.log('sending visitor');
    throw new NoAccessError('No account found');
  }
  console.log('profile found');
  res.send({
    role: req.session.user.role,
    name: req.session.user.name,
    profilePic: req.session.user.profilePic,
  });
});

module.exports = router;
