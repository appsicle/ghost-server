var express = require('express')
var router = express.Router()
const UserService = require('../services/user.service')

const { wrapAsync } = require('../middleware/errorHandler.middleware')
const { body, custom } = require('express-validator');
const { validate, isObjectId } = require('../middleware/expressValidator.middleware')

// TODO: deprecate or for debugging use only
// router.post('/create',
//   async (req, res, next) => {
//     const userDTO = req.body;

//     console.log(`Endpoint: "user/create", recieved: ${JSON.stringify(userDTO)}`)

//     const { confirmedUser, err } = await UserService.create(userDTO);

//     if (err) {
//       return res.status(500).json({ "err": "sumthing broke :3" })
//     }

//     // Return a response to client.
//     return res.json({ confirmedUser });
//   })

router.post('/retrieve',
  validate([
    body("userId")
      .exists().withMessage("required").bail()
      .custom(isObjectId),
  ]),
  wrapAsync(async (req, res, next) => {
    const userDTO = req.body;

    console.log(`Endpoint: "user/retrieve", recieved: ${JSON.stringify(userDTO)}`)

    const retrievedUser = await UserService.retrieve(userDTO);
    //TODO: dne considered an error?

    return res.json({ retrievedUser });
  }))

router.get('/role',
  (req, res) => {
    if (!req.session.user || !req.session.user.role) {
      console.log('sending visitor');
      console.log(req.session.user);
      res.send('VISITOR');
    } else {
      console.log('sending not visitor');
      console.log(req.session);
      res.send(req.session.user.role);
    }
  })

module.exports = router