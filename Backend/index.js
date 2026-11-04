const { PORT } = require('./utils/config')
const { connectToDatabase, pool } = require('./utils/db')
const { initializeModels } = require('./models')
const app = require('./app')

const start = async () => {
  await connectToDatabase()
  await initializeModels()
  app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`))
}

start().catch(async (error) => {
  console.error('Could not start backend:', error.message)
  await pool.end()
  process.exitCode = 1
})
