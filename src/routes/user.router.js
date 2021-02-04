var express = require('express')
var router = express.Router()
const UserService = require('../services/user.service')

router.post('/create', async (req, res, next) => {
    const userDTO = req.body;
    
    console.log(`Endpoint: "user/create", recieved: ${JSON.stringify(userDTO)}`)

    const { confirmedUser, err } = await UserService.create(userDTO);
    
    if (err){
        return res.status(500).json({ "err": "sumthing broke :3" })
    }

    // Return a response to client.
    return res.json({ confirmedUser });
})

router.post('/retrieve', async (req, res, next) => {
    const userDTO = req.body;

    console.log(`Endpoint: "user/retrieve", recieved: ${JSON.stringify(userDTO)}`)

    const { retrievedUser, err } = await UserService.retrieve(userDTO);

    if (err){
        return res.status(500).json({ "err": "sumthing broke :3" })
    }

    // Return a response to client.
    return res.json({ retrievedUser });
})

module.exports = router