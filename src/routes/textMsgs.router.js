var express = require('express')
var router = express.Router()
const TextMsgsService = require('../services/textMsgs.service')

const { body, param } = require('express-validator');
const { validate, isObjectId } = require('../middleware/expressValidator.middleware')

// TODO: get id based on user auth
router.post('/submit/:id',
    validate([
        param("id")
            .exists().withMessage("required").bail()
            .custom(isObjectId),
        body("firstName")
            .exists().withMessage("required").bail()
            .isString().notEmpty(),
        body("email")
            .exists().withMessage("required").bail()
            .isString().notEmpty(),
        body("additionalInfo")
            .exists().withMessage("required").bail()
            .isString(),
        body("imageURLs")
            .exists().withMessage("required").bail()
            .isArray().notEmpty(),
    ]),
    async (req, res, next) => {
        const id = req.params.id;
        const textMsgsDTO = req.body;

        console.log(`Endpoint: "textMsgs/submit/id", recieved: ${id} ${JSON.stringify(textMsgsDTO)}`)

        const { confirmedTextMsg, err } = await TextMsgsService.save(id, textMsgsDTO);

        if (err) {
            return res.status(500).json({ "err": "sumthing broke :3" })
        }

        // Return a response to client.
        return res.json({ confirmedTextMsg });
    })

// TODO: get id based on user auth
router.get('/retrieve/:id',
    validate([
        param("id")
            .exists().withMessage("required").bail()
            .custom(isObjectId)
    ]),
    async (req, res, next) => {
        const id = req.params.id

        console.log(`Endpoint: "textMsgs/retrieve/id", recieved: ${id}`)

        const { retrievedTextMsg, err } = await TextMsgsService.retrieve(id);

        if (err) {
            return res.status(500).json({ "err": "sumthing broke :3" })
        }

        // Return a response to client.
        return res.json({ retrievedTextMsg });
    })

router.post('/review',
    validate([
        body("textMsgId")
            .exists().withMessage("required").bail()
            .custom(isObjectId),
        body("reviewContent")
            .exists().withMessage("required").bail()
            .isArray(),
        body("imageURLs")
            .exists().withMessage("required").bail()
            .isArray(),
    ]),
    async (req, res, next) => {
        const reviewDTO = req.body;

        console.log(`Endpoint: "textMsgs/review", recieved: ${JSON.stringify(reviewDTO)}`)

        const { confirmedTextMsg, err } = await TextMsgsService.review(reviewDTO);

        // TODO: figure out a good error system for services
        if (err) {
            if (!err.severity || err.severity === 0) {
                return res.status(500).json({ "err": "sumthing broke :3" })
            } else {
                return res.status(500).json({ "err": err.msg })
            }
        }
        // Return a response to client.
        return res.json({ confirmedTextMsg });
    })

router.post('/getNext',
    validate([
        body("lastTextMsgId").optional().custom(isObjectId),
    ]),
    async (req, res, next) => {
        console.log(`Endpoint: "textMsgs/retrieve", recieved body: ${JSON.stringify(req.body)}`)

        const { lastTextMsgId } = req.body;

        try {
            // validate user 
            if (!req.session.user)
                return res.status(403).json({ "err": "Expired session, login again" })

            // fetch next textMsg
            const retrievedTextMsg = await TextMsgsService.retrieveNext(req.session.user.userId, lastTextMsgId);

            console.log(retrievedTextMsg)
            return res.json(retrievedTextMsg);
        } catch (err) {
            res.status(500).json({ "err": "sumthing broke :3" })
        }
    })

module.exports = router