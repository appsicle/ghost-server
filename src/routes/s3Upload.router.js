const express = require('express')
const router = express.Router()
const S3UploadService = require('../services/s3Upload.service')

const { body } = require('express-validator');
const { validate } = require('../middleware/expressValidator.middleware')

router.post('/getSignedURL',
    validate([
        body("contentType")
            .exists().withMessage("required").bail()
            .isString(),
        body("bucket")
            .exists().withMessage("required").bail()
            .isString()
    ])
    , async (req, res, next) => {
        // TODO: auth
        const getSignedURLDTO = req.body;
        console.log(`Endpoint: "getSignedURL", recieved: ${JSON.stringify(getSignedURLDTO)}`)

        const { key, uploadURL, err } = await S3UploadService.getSignedURL(getSignedURLDTO);

        if (err) {
            return res.status(500).json({ "err": "sumthing broke :3" })
        }

        return res.status(200).json({ key, uploadURL });
    })

module.exports = router