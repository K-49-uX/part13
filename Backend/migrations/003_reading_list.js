const up = async (client) => {
  await client.query(`
    CREATE TABLE reading_lists (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      blog_id INTEGER NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
      read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT reading_lists_user_blog_unique UNIQUE (user_id, blog_id)
    )
  `)
  await client.query('CREATE INDEX reading_lists_blog_id_idx ON reading_lists (blog_id)')
}

const down = async (client) => {
  await client.query('DROP TABLE IF EXISTS reading_lists CASCADE')
}

module.exports = { up, down }
