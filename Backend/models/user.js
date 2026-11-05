const { pool } = require('../utils/db')

const userSelect = `SELECT u.id, u.username, u.name,
  u.created_at AS "createdAt", u.updated_at AS "updatedAt",
  COALESCE(json_agg(json_build_object(
    'id', b.id, 'title', b.title, 'author', b.author, 'url', b.url, 'likes', b.likes, 'year', b.year
  ) ORDER BY b.id) FILTER (WHERE b.id IS NOT NULL), '[]') AS blogs
  FROM users u LEFT JOIN blogs b ON b.user_id = u.id`

const getAll = async () => {
  const { rows } = await pool.query(
    `${userSelect} GROUP BY u.id ORDER BY u.id`
  )
  return rows
}

const getById = async (id) => {
  const { rows } = await pool.query(`
    SELECT u.id, u.username, u.name,
      u.created_at AS "createdAt", u.updated_at AS "updatedAt",
      COALESCE((
        SELECT json_agg(json_build_object(
          'id', b.id, 'title', b.title, 'author', b.author, 'url', b.url,
          'likes', b.likes, 'year', b.year
        ) ORDER BY b.id)
        FROM blogs b
        WHERE b.user_id = u.id
      ), '[]') AS blogs,
      COALESCE((
        SELECT json_agg(json_build_object(
          'id', b.id, 'url', b.url, 'title', b.title, 'author', b.author,
          'likes', b.likes, 'year', b.year,
          'readingList', json_build_object('read', rl.read, 'id', rl.id)
        ) ORDER BY rl.id)
        FROM reading_lists rl
        JOIN blogs b ON b.id = rl.blog_id
        WHERE rl.user_id = u.id
      ), '[]') AS readings
    FROM users u
    WHERE u.id = $1
  `, [id])
  return rows[0] || null
}

const create = async ({ username, name, passwordHash }) => {
  const { rows } = await pool.query(
    `INSERT INTO users (username, name, password_hash) VALUES ($1, $2, $3)
     RETURNING id, username, name, created_at AS "createdAt", updated_at AS "updatedAt"`,
    [username, name, passwordHash]
  )
  return rows[0]
}

const findByUsername = async (username) => {
  const { rows } = await pool.query(
    'SELECT id, username, name, password_hash FROM users WHERE LOWER(username) = LOWER($1)',
    [username]
  )
  return rows[0] || null
}

const updateName = async (username, name) => {
  const { rows } = await pool.query(
    `UPDATE users SET name = $1, updated_at = CURRENT_TIMESTAMP
     WHERE username = $2
     RETURNING id, username, name, created_at AS "createdAt", updated_at AS "updatedAt"`,
    [name, username]
  )
  return rows[0] || null
}

module.exports = { getAll, getById, create, findByUsername, updateName }
