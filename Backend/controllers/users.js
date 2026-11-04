const bcrypt = require('bcrypt')
const express = require('express')
const { User } = require('../models')

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    res.json(await User.getAll())
  } catch (error) { next(error) }
})

router.post('/', async (req, res, next) => {
  const { username, name, password } = req.body || {}
  if (typeof username !== 'string' || username.trim().length < 3 ||
      typeof password !== 'string' || password.length < 3) {
    return res.status(400).json({ error: 'username and password must each have at least 3 characters' })
  }
  try {
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({
      username: username.trim(),
      name: typeof name === 'string' ? name : '',
      passwordHash,
    })
    res.status(201).json({ ...user, blogs: [] })
  } catch (error) {
    if (error.code === '23505') return res.status(400).json({ error: 'username already exists' })
    next(error)
  }
})

module.exports = router
