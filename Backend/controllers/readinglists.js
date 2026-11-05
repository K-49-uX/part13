const express = require('express')
const { Blog, User } = require('../models')
const ReadingList = require('../models/readingList')
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

module.exports = router
