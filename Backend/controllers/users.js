const bcrypt = require('bcrypt')
const express = require('express')
const { User } = require('../models')
const httpError = require('../utils/httpError')

const router = express.Router()

router.get('/', async (req, res) => {
  res.json(await User.getAll())
})

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) throw httpError(400, 'invalid user id')
  const user = await User.getById(id)
  if (!user) throw httpError(404, 'user not found')
  res.json(user)
})

router.post('/', async (req, res) => {
  const { username, name, password } = req.body || {}
  if (typeof username !== 'string' || !username.trim() ||
      typeof name !== 'string' || !name.trim() ||
      typeof password !== 'string' || password.length < 3) {
    throw httpError(400, 'name, username, and a password of at least 3 characters are required')
  }
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({
    username: username.trim(),
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
