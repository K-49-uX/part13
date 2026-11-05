const { createHash } = require('node:crypto')
const { pool } = require('../utils/db')

const tokenHash = (token) => createHash('sha256').update(token).digest('hex')

const Session = {
  create: async ({ userId, token, expiresAt }) => {
    const { rows } = await pool.query(`
      INSERT INTO sessions (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id, user_id AS "userId", expires_at AS "expiresAt"
    `, [userId, tokenHash(token), expiresAt])
    return rows[0]
  },

  isValid: async ({ userId, token }) => {
    const { rowCount } = await pool.query(`
      SELECT s.id
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.user_id = $1
        AND s.token_hash = $2
        AND s.expires_at > CURRENT_TIMESTAMP
        AND u.disabled = FALSE
    `, [userId, tokenHash(token)])
    return rowCount > 0
  },

  deleteByToken: async (token) => {
    await pool.query('DELETE FROM sessions WHERE token_hash = $1', [tokenHash(token)])
  },
}

module.exports = Session
