const bcrypt = require('bcrypt')
const express = require('express')
const jwt = require('jsonwebtoken')
const { Session, User } = require('../models')
const { createToken, TOKEN_TTL_SECONDS } = require('../utils/auth')

const router = express.Router()

router.post('/', async (req, res) => {
  const { username, password } = req.body || {}
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(401).json({ error: 'invalid username or password' })
  }
  const user = await User.findByUsername(username)
  if (!user || user.disabled || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'invalid username or password' })
  }
  const token = createToken(user)
  const decoded = jwt.decode(token)
  await Session.create({
    userId: user.id,
    token,
    expiresAt: new Date(decoded.exp * 1000),
  })
  res.json({ id: user.id, username: user.username, name: user.name, token })
})

module.exports = router
