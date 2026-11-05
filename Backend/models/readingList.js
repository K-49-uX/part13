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

const updateReadByOwner = async ({ id, userId, read }) => {
  const { rows } = await pool.query(`
    UPDATE reading_lists
    SET read = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2 AND user_id = $3
    RETURNING id, user_id AS "userId", blog_id AS "blogId", read,
      created_at AS "createdAt", updated_at AS "updatedAt"
  `, [read, id, userId])
  return rows[0] || null
}

module.exports = { create, updateReadByOwner }
