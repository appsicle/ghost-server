var express = require('express')
var router = express.Router()
const TextMsgsService = require('../services/textMsgs.service')

const { wrapAsync } = require('../middleware/errorHandler.middleware')
const { body, param } = require('express-validator');
const { validate, isObjectId } = require('../middleware/expressValidator.middleware')
const DEBUG = true;

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
    wrapAsync(async (req, res) => {
        const id = req.params.id;
        const textMsgsDTO = req.body;

        console.log(`Endpoint: "textMsgs/submit/id", recieved: ${id} ${JSON.stringify(textMsgsDTO)}`)

        const confirmedTextMsg = await TextMsgsService.save(id, textMsgsDTO);

        return res.json({ confirmedTextMsg });
    }))

// TODO: get id based on user auth
router.get('/retrieve/:id',
    validate([
        param("id")
            .exists().withMessage("required").bail()
            .custom(isObjectId)
    ]),
    wrapAsync(async (req, res) => {
        const id = req.params.id

        console.log(`Endpoint: "textMsgs/retrieve/id", recieved: ${id}`)

        const retrievedTextMsg = await TextMsgsService.retrieve(id);

        return res.json({ retrievedTextMsg });
    }))

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
    wrapAsync(async (req, res) => {
        const reviewDTO = req.body;

        console.log(`Endpoint: "textMsgs/review", recieved: ${JSON.stringify(reviewDTO)}`)

        const confirmedTextMsg = await TextMsgsService.review(reviewDTO);

        return res.json({ confirmedTextMsg });
    })
)

router.post('/getNext',
    validate([
        body("lastTextMsgId").optional().custom(isObjectId),
    ]),
    wrapAsync(async (req, res) => {
        console.log(`Endpoint: "textMsgs/retrieve", recieved body: ${JSON.stringify(req.body)}`)

        const { lastTextMsgId } = req.body;

        // TODO: middleware to check for user in session
        // validate user 
        if (!req.session.user)
            return res.status(403).json({ "err": "Expired session, login again" })

        // fetch next textMsg
        const retrievedTextMsg = await TextMsgsService.retrieveNext(req.session.user.userId, lastTextMsgId);

        console.log(retrievedTextMsg)
        return res.json(retrievedTextMsg);
    })
)

router.post('/_clear',
    validate([
        body("reviewerId")
            .exists().withMessage("required").bail()
            .custom(isObjectId),
        body("seen")
            .optional()
            .isBoolean(),
        body("review")
            .optional()
            .isBoolean()
    ]),
    wrapAsync(async (req, res) => {

        if (!DEBUG) {
            return res.status(404)
        }

        console.log(`Endpoint: "_clearSeen", recieved body: ${JSON.stringify(req.body)}`)

        const { reviewerId, seen, review } = req.body;

        // fetch next textMsg
        const retrievedTextMsg = await TextMsgsService._clearReviewerFromAll(reviewerId, seen, review)

        console.log(retrievedTextMsg)
        return res.json(retrievedTextMsg);
    })
)

module.exports = router