const bcrypt = require('bcrypt')
const express = require('express')
const { User } = require('../models')
const httpError = require('../utils/httpError')

const router = express.Router()
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

router.get('/', async (req, res) => {
  res.json(await User.getAll())
})

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) throw httpError(400, 'invalid user id')
  let read = null
  if (req.query.read !== undefined) {
    if (req.query.read !== 'true' && req.query.read !== 'false') {
      throw httpError(400, 'read must be true or false')
    }
    read = req.query.read === 'true'
  }
  const user = await User.getById(id, read)
  if (!user) throw httpError(404, 'user not found')
  res.json(user)
})

router.post('/', async (req, res) => {
  const { username, name, password } = req.body || {}
  if (typeof username !== 'string' || !emailPattern.test(username.trim())) {
    throw httpError(400, ['username must be a valid email address'])
  }
  if (typeof name !== 'string' || !name.trim()) {
    throw httpError(400, ['name must not be empty'])
  }
  if (typeof password !== 'string' || password.length < 3) {
    throw httpError(400, ['password must have at least 3 characters'])
  }

  const normalizedUsername = username.trim().toLowerCase()
  if (await User.findByUsername(normalizedUsername)) {
    throw httpError(400, ['username must be unique'])
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({
    username: normalizedUsername,
    name: typeof name === 'string' ? name : '',
    passwordHash,
  })
  res.status(201).json({ ...user, blogs: [] })
})

router.put('/:username', async (req, res) => {
  const { name } = req.body || {}
  if (typeof name !== 'string' || !name.trim()) {
    throw httpError(400, 'name must not be empty')
  }
  const user = await User.updateName(req.params.username, name.trim())
  if (!user) throw httpError(404, 'user not found')
  res.json(user)
})

module.exports = router
