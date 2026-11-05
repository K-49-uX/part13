const express = require('express')
const { Blog, User } = require('../models')
const ReadingList = require('../models/readingList')
const { getAuthenticatedUser } = require('../utils/auth')
const httpError = require('../utils/httpError')

const router = express.Router()

router.post('/', async (req, res) => {
  const { blogId, userId } = req.body || {}
  if (!Number.isInteger(blogId) || blogId < 1) {
    throw httpError(400, 'blogId must be a positive integer')
  }
  if (!Number.isInteger(userId) || userId < 1) {
    throw httpError(400, 'userId must be a positive integer')
  }

  if (!await Blog.getById(blogId)) throw httpError(404, `blog ${blogId} not found`)
  if (!await User.getById(userId)) throw httpError(404, `user ${userId} not found`)

  const reading = await ReadingList.create({ blogId, userId })
  res.status(201).json(reading)
})

router.put('/:id', async (req, res) => {
  const user = await getAuthenticatedUser(req)
  if (!user) throw httpError(401, 'token missing or invalid')

  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) throw httpError(400, 'invalid reading list id')
  if (typeof req.body?.read !== 'boolean') throw httpError(400, 'read must be a boolean')

  const entry = await ReadingList.getById(id)
  if (!entry) throw httpError(404, 'reading list entry not found')
  if (entry.userId !== user.id) throw httpError(401, 'not authorized to update this reading list entry')

  const updated = await ReadingList.updateReadByOwner({ id, userId: user.id, read: req.body.read })
  if (!updated) throw httpError(404, 'reading list entry not found')
  res.json(updated)
})

module.exports = router
