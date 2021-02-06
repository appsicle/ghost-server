const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');
const axios = require('axios');
const userService = require('../services/user.service');

router.post('/signIn', async (req, res) => {
  const token = req.body.id_token; // TODO: send this over header instead
  const role = req.body.role;
  const { sub: googleId, name, email } = await authService.verifyToken(token);
  userService.create(googleId, name, email, role);
  res.send();
});

module.exports = router;
