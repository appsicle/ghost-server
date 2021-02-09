const express = require('express')
const router = express.Router()
const S3UploadService = require('../services/s3Upload.service')

const { wrapAsync } = require('../middleware/errorHandler.middleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/expressValidator.middleware')

router.post('/getSignedURL',
    validate([
        body("contentType")
            .exists().withMessage("required").bail()
            .isIn(["image/jpeg", "image/png"]).withMessage("Supported contentType: image/jpeg, image/png"),
        body("bucket")
            .exists().withMessage("required").bail()
            .isIn(["reviewerProfilePic", "textMsgs"]).withMessage("Supported buckets: reviewerProfilePic, textMsgs"),
    ]),
    wrapAsync(async (req, res) => {
        // TODO: auth
        const getSignedURLDTO = req.body;
        console.log(`Endpoint: "getSignedURL", recieved: ${JSON.stringify(getSignedURLDTO)}`)

        const { key, uploadURL } = await S3UploadService.getSignedURL(getSignedURLDTO);

        return res.status(200).json({ key, uploadURL });
    }))

module.exports = router