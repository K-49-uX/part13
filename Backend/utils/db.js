const { Pool } = require('pg')
const { DATABASE_URL, PGSSL } = require('./config')

if (!DATABASE_URL) {
  console.warn('DATABASE_URL is not set. Add your PostgreSQL service URI to Backend/.env before starting the server.')
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: PGSSL ? { rejectUnauthorized: false } : undefined,
})

const connectToDatabase = async () => {
  try {
    await pool.query('SELECT 1')
    console.log('connected to the database')
  } catch (error) {
    console.error('failed to connect to the database')
    throw error
  }
}

module.exports = { pool, connectToDatabase }
