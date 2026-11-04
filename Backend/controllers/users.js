const bcrypt = require('bcrypt')
const express = require('express')
const { User } = require('../models')
const httpError = require('../utils/httpError')

const router = express.Router()

router.get('/', async (req, res) => {
  res.json(await User.getAll())
})

router.post('/', async (req, res) => {
  const { username, name, password } = req.body || {}
  if (typeof username !== 'string' || username.trim().length < 3 ||
      typeof password !== 'string' || password.length < 3) {
    throw httpError(400, 'username and password must each have at least 3 characters')
  }
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({
    username: username.trim(),
    name: typeof name === 'string' ? name : '',
    passwordHash,
  })
  res.status(201).json({ ...user, blogs: [] })
})

module.exports = router
