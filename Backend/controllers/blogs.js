const express = require('express')
const { Blog } = require('../models')
const { getAuthenticatedUser } = require('../utils/auth')
const httpError = require('../utils/httpError')

const router = express.Router()

router.get('/', async (req, res) => {
  res.json(await Blog.getAll(req.query.search))
})

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) throw httpError(400, 'invalid blog id')
  const blog = await Blog.getById(id)
  if (!blog) throw httpError(404, 'blog not found')
  res.json(blog)
})

router.post('/', async (req, res) => {
  const user = await getAuthenticatedUser(req)
  if (!user) throw httpError(401, 'token missing or invalid')
  const body = req.body || {}
  const { title, author = '', url } = body
  const year = Object.hasOwn(body, 'year') ? body.year : new Date().getFullYear()
  if (typeof title !== 'string' || !title.trim() || typeof url !== 'string' || !url.trim()) {
    throw httpError(400, 'title and url are required')
  }
  const currentYear = new Date().getFullYear()
  if (!Number.isInteger(year) || year < 1991 || year > currentYear) {
    throw httpError(400, `year must be an integer between 1991 and ${currentYear}`)
  }
  const created = await Blog.create({
    title: title.trim(),
    author: typeof author === 'string' ? author : '',
    url: url.trim(),
    year,
    userId: user.id,
  })
  res.status(201).json(created)
})

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const likes = Number(req.body?.likes)
  if (!Number.isInteger(id) || id < 1 || !Number.isInteger(likes) || likes < 0) {
    throw httpError(400, 'valid blog id and non-negative likes are required')
  }
  const updated = await Blog.updateLikes(id, likes)
  if (!updated) throw httpError(404, 'blog not found')
  res.json(updated)
})

router.delete('/:id', async (req, res) => {
  const user = await getAuthenticatedUser(req)
  if (!user) throw httpError(401, 'token missing or invalid')
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) throw httpError(400, 'invalid blog id')
  const deleted = await Blog.deleteOwned(id, user.id)
  if (!deleted) throw httpError(404, 'blog not found or not owned by user')
  res.status(204).end()
})

module.exports = router
