const express = require('express')
const { pool } = require('../utils/db')
const { getAuthenticatedUser } = require('../utils/auth')

const router = express.Router()
const selectBlog = `SELECT b.id, b.title, b.author, b.url, b.likes,
  json_build_object('id', u.id, 'username', u.username, 'name', u.name) AS "user"
  FROM blogs b JOIN users u ON u.id = b.user_id`

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`${selectBlog} ORDER BY b.likes DESC, b.id ASC`)
    res.json(rows)
  } catch (error) { next(error) }
})

router.get('/:id', async (req, res, next) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'invalid blog id' })
  try {
    const { rows } = await pool.query(`${selectBlog} WHERE b.id = $1`, [id])
    if (!rows[0]) return res.status(404).json({ error: 'blog not found' })
    res.json(rows[0])
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
    const { rows } = await pool.query(
      `INSERT INTO blogs (title, author, url, user_id) VALUES ($1, $2, $3, $4) RETURNING id`,
      [title.trim(), typeof author === 'string' ? author : '', url.trim(), user.id]
    )
    const created = await pool.query(`${selectBlog} WHERE b.id = $1`, [rows[0].id])
    res.status(201).json(created.rows[0])
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
    const result = await pool.query('UPDATE blogs SET likes = $1 WHERE id = $2', [likes, id])
    if (!result.rowCount) return res.status(404).json({ error: 'blog not found' })
    const { rows } = await pool.query(`${selectBlog} WHERE b.id = $1`, [id])
    res.json(rows[0])
  } catch (error) { next(error) }
})

router.delete('/:id', async (req, res, next) => {
  const user = getAuthenticatedUser(req)
  if (!user) return res.status(401).json({ error: 'token missing or invalid' })
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'invalid blog id' })
  try {
    const result = await pool.query('DELETE FROM blogs WHERE id = $1 AND user_id = $2', [id, user.id])
    if (!result.rowCount) return res.status(404).json({ error: 'blog not found or not owned by user' })
    res.status(204).end()
  } catch (error) { next(error) }
})

module.exports = router
