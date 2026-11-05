const { pool } = require('../utils/db')

const create = async ({ userId, blogId }) => {
  const { rows } = await pool.query(`
    INSERT INTO reading_lists (user_id, blog_id)
    VALUES ($1, $2)
    RETURNING id, user_id AS "userId", blog_id AS "blogId", read,
      created_at AS "createdAt", updated_at AS "updatedAt"
  `, [userId, blogId])
  return rows[0]
}

module.exports = { create }
