const bcrypt = require('bcrypt')
const express = require('express')
const { pool } = require('../utils/db')
const { createToken } = require('../utils/auth')

const router = express.Router()

router.post('/', async (req, res, next) => {
  const { username, password } = req.body || {}
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(401).json({ error: 'invalid username or password' })
  }
  try {
    const { rows } = await pool.query('SELECT id, username, name, password_hash FROM users WHERE username = $1', [username])
    const user = rows[0]
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'invalid username or password' })
    }
    res.json({ id: user.id, username: user.username, name: user.name, token: createToken(user) })
  } catch (error) { next(error) }
})

module.exports = router
