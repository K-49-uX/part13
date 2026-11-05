const up = async (client) => {
  await client.query(`
    ALTER TABLE blogs
    ADD COLUMN year INTEGER NOT NULL
      DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
      CHECK (year >= 1991 AND year <= EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER)
  `)
}

const down = async (client) => {
  await client.query('ALTER TABLE blogs DROP COLUMN year')
}

module.exports = { up, down }
