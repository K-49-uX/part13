const bcrypt = require('bcrypt')
const express = require('express')
const { pool } = require('../utils/db')

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.username, u.name, COALESCE(json_agg(json_build_object(
        'id', b.id, 'title', b.title, 'author', b.author, 'url', b.url, 'likes', b.likes
      ) ORDER BY b.id) FILTER (WHERE b.id IS NOT NULL), '[]') AS blogs
       FROM users u LEFT JOIN blogs b ON b.user_id = u.id GROUP BY u.id ORDER BY u.id`
    )
    res.json(rows)
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
    const { rows } = await pool.query(
      'INSERT INTO users (username, name, password_hash) VALUES ($1, $2, $3) RETURNING id, username, name',
      [username.trim(), typeof name === 'string' ? name : '', passwordHash]
    )
    res.status(201).json({ ...rows[0], blogs: [] })
  } catch (error) {
    if (error.code === '23505') return res.status(400).json({ error: 'username already exists' })
    next(error)
  }
})

module.exports = router
