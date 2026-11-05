const up = async (client) => {
  // This is the first migration for this app. Replace its existing untracked
  // tables with the migration-managed schema.
  await client.query('DROP TABLE IF EXISTS blogs CASCADE')
  await client.query('DROP TABLE IF EXISTS users CASCADE')

  await client.query(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await client.query('CREATE UNIQUE INDEX users_username_lower_unique ON users (LOWER(username))')
  await client.query(`
    CREATE TABLE blogs (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL DEFAULT '',
      url TEXT NOT NULL,
      likes INTEGER NOT NULL DEFAULT 0 CHECK (likes >= 0),
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
}

const down = async (client) => {
  await client.query('DROP TABLE IF EXISTS blogs CASCADE')
  await client.query('DROP TABLE IF EXISTS users CASCADE')
}

module.exports = { up, down }
