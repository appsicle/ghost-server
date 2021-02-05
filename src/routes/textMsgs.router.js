var express = require('express')
var router = express.Router()
const TextMsgsService = require('../services/textMsgs.service')

// TODO: get id based on user auth
router.post('/submit/:id', async (req, res, next) => {
    const id = req.params.id;
    const textMsgsDTO = req.body;
    
    console.log(`Endpoint: "textMsgs/submit/id", recieved: ${id} ${JSON.stringify(textMsgsDTO)}`)

    const { confirmedTextMsg, err } = await TextMsgsService.save(id, textMsgsDTO);
    
    if (err){
        return res.status(500).json({ "err": "sumthing broke :3" })
    }

    // Return a response to client.
    return res.json({ confirmedTextMsg });
})

// TODO: get id based on user auth
router.get('/retrieve/:id', async (req, res, next) => {
    const id = req.params.id

    console.log(`Endpoint: "textMsgs/retrieve/id", recieved: ${id}`)

    const { retrievedTextMsg, err } = await TextMsgsService.retrieve(id);

    if (err){
        return res.status(500).json({ "err": "sumthing broke :3" })
    }

    // Return a response to client.
    return res.json({ retrievedTextMsg });
})

router.post('/review', async (req, res, next) => {
    const reviewDTO = req.body;

    console.log(`Endpoint: "textMsgs/review", recieved: ${JSON.stringify(reviewDTO)}`)

    const { confirmedTextMsg, err } = await TextMsgsService.review(reviewDTO);

    // TODO: figure out a good error system for services
    if (err){
        if (!err.severity || err.severity === 0){
            return res.status(500).json({ "err": "sumthing broke :3" })
        }else{
            return res.status(500).json({ "err": err.msg })
        }
    }
    // Return a response to client.
    return res.json({ confirmedTextMsg });
})

module.exports = router