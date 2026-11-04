const { pool } = require('../utils/db')

const getAll = async () => {
  const { rows } = await pool.query(
    `SELECT u.id, u.username, u.name, COALESCE(json_agg(json_build_object(
      'id', b.id, 'title', b.title, 'author', b.author, 'url', b.url, 'likes', b.likes
    ) ORDER BY b.id) FILTER (WHERE b.id IS NOT NULL), '[]') AS blogs
     FROM users u LEFT JOIN blogs b ON b.user_id = u.id GROUP BY u.id ORDER BY u.id`
  )
  return rows
}

const create = async ({ username, name, passwordHash }) => {
  const { rows } = await pool.query(
    'INSERT INTO users (username, name, password_hash) VALUES ($1, $2, $3) RETURNING id, username, name',
    [username, name, passwordHash]
  )
  return rows[0]
}

const findByUsername = async (username) => {
  const { rows } = await pool.query(
    'SELECT id, username, name, password_hash FROM users WHERE username = $1',
    [username]
  )
  return rows[0] || null
}

module.exports = { getAll, create, findByUsername }
