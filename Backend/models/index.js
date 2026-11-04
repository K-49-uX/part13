const bcrypt = require('bcrypt')
const crypto = require('node:crypto')
const { pool } = require('../utils/db')

const Blog = require('./blog')
const User = require('./user')

const initializeModels = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS blogs (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL DEFAULT '',
      url TEXT NOT NULL,
      likes INTEGER NOT NULL DEFAULT 0 CHECK (likes >= 0),
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()')

  // Seed only an empty blog table so a fresh frontend has example content.
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('SELECT pg_advisory_xact_lock($1)', [130013])
    const { rows: blogCount } = await client.query('SELECT COUNT(*)::int AS count FROM blogs')
    if (blogCount[0].count === 0) {
      let { rows: users } = await client.query('SELECT id FROM users ORDER BY id LIMIT 1')
      if (users.length === 0) {
        const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10)
        const inserted = await client.query(
          `INSERT INTO users (username, name, password_hash)
           VALUES ('sample-author', 'Sample Blog Author', $1) RETURNING id`,
          [passwordHash]
        )
        users = inserted.rows
      }

      const samples = [
        ['A Beginner’s Guide to Better Reading', 'Maya Rivers', 'https://example.com/blog/better-reading', 8],
        ['What I Learned Building Small Projects', 'Noah Kim', 'https://example.com/blog/small-projects', 5],
        ['A Weekend Without Notifications', 'Amina Patel', 'https://example.com/blog/weekend-offline', 2],
      ]
      for (const [title, author, url, likes] of samples) {
        await client.query(
          'INSERT INTO blogs (title, author, url, likes, user_id) VALUES ($1, $2, $3, $4, $5)',
          [title, author, url, likes, users[0].id]
        )
      }
    }
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

module.exports = { Blog, User, initializeModels }
