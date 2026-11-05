const fs = require('node:fs')
const path = require('node:path')
const { pool } = require('./db')

const migrationsDirectory = path.join(__dirname, '..', 'migrations')

const runMigrations = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  const filenames = fs.readdirSync(migrationsDirectory)
    .filter((filename) => /^\d+_.+\.js$/.test(filename))
    .sort()

  for (const filename of filenames) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const { rows } = await client.query(
        'SELECT 1 FROM schema_migrations WHERE name = $1',
        [filename]
      )
      if (rows.length === 0) {
        const migration = require(path.join(migrationsDirectory, filename))
        await migration.up(client)
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [filename])
      }
      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
}

module.exports = { runMigrations }
