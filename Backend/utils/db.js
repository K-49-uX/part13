const { Pool } = require('pg')
const { DATABASE_URL, PGSSL, TESTING } = require('./config')

if (!DATABASE_URL) {
  const variable = TESTING ? 'TEST_DATABASE_URL' : 'DATABASE_URL'
  throw new Error(`${variable} is not set. Configure it in Backend/.env before starting the server.`)
}
// Create a new PostgreSQL connection pool using the connection string from the environment variable DATABASE_URL. If PGSSL is set, configure SSL with rejectUnauthorized set to false.
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: PGSSL ? { rejectUnauthorized: false } : undefined,
})
// Function to test the database connection by executing a simple query. If the query is successful, it logs a success message; otherwise, it logs an error message and throws the error.
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
