const express = require('express')
const router = express.Router()
const S3UploadService = require('../services/s3Upload.service')

router.get('/getSignedURL', async (req, res, next) => {
    // TODO: auth

    const { key, uploadURL, err } = await S3UploadService.getSignedURL();

    if (err) {
        return res.status(500).json({ "err": "sumthing broke :3" })
    }

    return res.status(200).json({ key, uploadURL });
})

module.exports = router