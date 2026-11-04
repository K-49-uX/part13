const express = require('express')
const { Blog } = require('../models')
const { getAuthenticatedUser } = require('../utils/auth')

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    res.json(await Blog.getAll())
  } catch (error) { next(error) }
})

router.get('/:id', async (req, res, next) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'invalid blog id' })
  try {
    const blog = await Blog.getById(id)
    if (!blog) return res.status(404).json({ error: 'blog not found' })
    res.json(blog)
  } catch (error) { next(error) }
})

router.post('/', async (req, res, next) => {
  const user = getAuthenticatedUser(req)
  if (!user) return res.status(401).json({ error: 'token missing or invalid' })
  const { title, author = '', url } = req.body || {}
  if (typeof title !== 'string' || !title.trim() || typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({ error: 'title and url are required' })
  }
  try {
    const created = await Blog.create({
      title: title.trim(),
      author: typeof author === 'string' ? author : '',
      url: url.trim(),
      userId: user.id,
    })
    res.status(201).json(created)
  } catch (error) { next(error) }
})

router.put('/:id', async (req, res, next) => {
  if (!getAuthenticatedUser(req)) return res.status(401).json({ error: 'token missing or invalid' })
  const id = Number(req.params.id)
  const likes = Number(req.body?.likes)
  if (!Number.isInteger(id) || id < 1 || !Number.isInteger(likes) || likes < 0) {
    return res.status(400).json({ error: 'valid blog id and non-negative likes are required' })
  }
  try {
    const updated = await Blog.updateLikes(id, likes)
    if (!updated) return res.status(404).json({ error: 'blog not found' })
    res.json(updated)
  } catch (error) { next(error) }
})

router.delete('/:id', async (req, res, next) => {
  const user = getAuthenticatedUser(req)
  if (!user) return res.status(401).json({ error: 'token missing or invalid' })
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'invalid blog id' })
  try {
    const deleted = await Blog.deleteOwned(id, user.id)
    if (!deleted) return res.status(404).json({ error: 'blog not found or not owned by user' })
    res.status(204).end()
  } catch (error) { next(error) }
})

module.exports = router
