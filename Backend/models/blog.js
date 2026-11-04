const { pool } = require('../utils/db')

const selectWithUser = `SELECT b.id, b.title, b.author, b.url, b.likes,
  json_build_object('id', u.id, 'username', u.username, 'name', u.name) AS "user"
  FROM blogs b JOIN users u ON u.id = b.user_id`

const getAll = async () => {
  const { rows } = await pool.query(`${selectWithUser} ORDER BY b.likes DESC, b.id ASC`)
  return rows
}

const getById = async (id) => {
  const { rows } = await pool.query(`${selectWithUser} WHERE b.id = $1`, [id])
  return rows[0] || null
}

const create = async ({ title, author, url, userId }) => {
  const { rows } = await pool.query(
    'INSERT INTO blogs (title, author, url, user_id) VALUES ($1, $2, $3, $4) RETURNING id',
    [title, author, url, userId]
  )
  return getById(rows[0].id)
}

const updateLikes = async (id, likes) => {
  const result = await pool.query('UPDATE blogs SET likes = $1 WHERE id = $2', [likes, id])
  return result.rowCount ? getById(id) : null
}

const deleteOwned = async (id, userId) => {
  const result = await pool.query('DELETE FROM blogs WHERE id = $1 AND user_id = $2', [id, userId])
  return result.rowCount > 0
}

module.exports = { getAll, getById, create, updateLikes, deleteOwned }
