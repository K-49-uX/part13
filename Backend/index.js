const { PORT } = require('./utils/config')
const { connectToDatabase, pool } = require('./utils/db')
const { runMigrations } = require('./utils/migrate')
const app = require('./app')

const start = async () => {
  await connectToDatabase()
  await runMigrations()
  app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`))
}

start().catch(async (error) => {
  console.error('Could not start backend:', error.message)
  await pool.end()
  process.exitCode = 1
})
