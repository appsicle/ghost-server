var express = require('express')
var router = express.Router()
const TextMsgsService = require('../services/textMsgs.service')

const { wrapAsync } = require('../middleware/errorHandler.middleware')
const { body, query } = require('express-validator');
const { validate, isObjectId } = require('../middleware/expressValidator.middleware')

const { isLoggedIn, hasRole } = require('../middleware/auth.middleware')

router.post('/submit',
    isLoggedIn,
    hasRole("REVIEWEE"),
    validate([
        body("additionalInfo")
            .exists().withMessage("required").bail()
            .isString(),
        body("imageURLs")
            .exists().withMessage("required").bail()
            .isArray().notEmpty(),
    ]),
    wrapAsync(async (req, res) => {
        const { additionalInfo, imageURLs } = req.body;

        console.log(`Endpoint: "textMsgs/submit", recieved: ${JSON.stringify(req.body)}`)

        const confirmedTextMsg = await TextMsgsService.save(req.session.user, additionalInfo, imageURLs);

        return res.json({ confirmedTextMsg });
    }))

router.get('/retrieve',
    isLoggedIn,
    validate([
        query("textMsgId")
            .exists().withMessage("required").bail()
            .custom(isObjectId)
    ]),
    wrapAsync(async (req, res) => {
        const { textMsgId } = req.query

        console.log(`Endpoint: "textMsgs/retrieve", recieved: ${textMsgId}`)

        const retrievedTextMsg = await TextMsgsService.retrieve(textMsgId);

        return res.json({ retrievedTextMsg });
    }))

router.post('/review',
    isLoggedIn,
    hasRole("REVIEWER"),
    validate([
        body("textMsgId")
            .exists().withMessage("required").bail()
            .custom(isObjectId),
        body("reviewContent")
            .exists().withMessage("required").bail()
            .isArray(),
    ]),
    wrapAsync(async (req, res) => {
        const { textMsgId, reviewContent } = req.body;

        console.log(`Endpoint: "textMsgs/review", recieved: ${JSON.stringify(req.body)}`)

        const confirmedTextMsg = await TextMsgsService.review(req.session.user, textMsgId, reviewContent);

        return res.json({ confirmedTextMsg });
    })
)

router.post('/getNext',
    isLoggedIn,
    hasRole("REVIEWER"),
    validate([
        body("lastTextMsgId").optional().custom(isObjectId),
    ]),
    wrapAsync(async (req, res) => {
        console.log(`Endpoint: "textMsgs/retrieve", recieved body: ${JSON.stringify(req.body)}`)

        const { lastTextMsgId } = req.body;

        // fetch next textMsg
        const retrievedTextMsg = await TextMsgsService.retrieveNext(req.session.user.userId, lastTextMsgId);

        console.log(retrievedTextMsg)
        return res.json(retrievedTextMsg);
    })
)

router.get('/reviews',
  isLoggedIn,
  hasRole("REVIEWEE"),
  wrapAsync(async (req, res) => {
    const userId = req.session.user.userId;
    console.log(req.session.user);
    const pastSubmissions = await TextMsgsService.retrieveSubmissionsForUser(userId);
    return res.json(pastSubmissions);
  })
)


// TODO: find a way to keep this admin only
router.post('/_clear',
    validate([
        body("reviewerId")
            .exists().withMessage("required").bail(),
        body("seen")
            .optional()
            .isBoolean(),
        body("review")
            .optional()
            .isBoolean()
    ]),
    wrapAsync(async (req, res) => {

        console.log(`Endpoint: "_clear", recieved body: ${JSON.stringify(req.body)}`)

        const { reviewerId, seen, review } = req.body;

        // fetch next textMsg
        const retrievedTextMsg = await TextMsgsService._clearReviewerFromAll(reviewerId, seen, review)

        console.log(retrievedTextMsg)
        return res.json(retrievedTextMsg);
    })
)

module.exports = router