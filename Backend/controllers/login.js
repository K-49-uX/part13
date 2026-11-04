const bcrypt = require('bcrypt')
const express = require('express')
const { User } = require('../models')
const { createToken } = require('../utils/auth')

const router = express.Router()

router.post('/', async (req, res) => {
  const { username, password } = req.body || {}
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(401).json({ error: 'invalid username or password' })
  }
  const user = await User.findByUsername(username)
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'invalid username or password' })
  }
  res.json({ id: user.id, username: user.username, name: user.name, token: createToken(user) })
})

module.exports = router
