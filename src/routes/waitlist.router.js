var express = require('express');
var router = express.Router();

const { wrapAsync } = require('../middleware/errorHandler.middleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/expressValidator.middleware');

const mongoose = require('mongoose');
const waitlistSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (value) {
          return new Promise((resolve, reject) => {
            this.constructor
              .findOne({ email: value })
              .then((model) =>
                model._id
                  ? reject(new Error('Email already in use'))
                  : resolve(true),
              )
              .catch((err) => resolve(true));
          });
        },
      },
    },
  },
  { timestamps: true },
);
const WaitlistModel = mongoose.model('waitlist', waitlistSchema);

router.post(
  '/waitlist',
  validate([body('email').exists().withMessage('required').isEmail()]),
  wrapAsync(async (req, res) => {
    const { email } = req.body;

    console.log(
      `Endpoint: "textMsgs/submit", recieved: ${JSON.stringify(req.body)}`,
    );

    try {
      await new WaitlistModel({ email }).save();
      res.status(200).send();
    } catch (err) {
      res.status(409).send();
    }
  }),
);

module.exports = router;
