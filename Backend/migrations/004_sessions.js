const up = async (client) => {
  await client.query(`
    ALTER TABLE users
    ADD COLUMN disabled BOOLEAN NOT NULL DEFAULT FALSE
  `)
  await client.query(`
    CREATE TABLE sessions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash CHAR(64) NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await client.query('CREATE INDEX sessions_user_id_idx ON sessions (user_id)')
}

const down = async (client) => {
  await client.query('DROP TABLE IF EXISTS sessions CASCADE')
  await client.query('ALTER TABLE users DROP COLUMN IF EXISTS disabled')
}

module.exports = { up, down }
