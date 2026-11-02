require('dotenv').config({ path: require('node:path').join(__dirname, '.env') })

const app = require('./app')
const { initializeDatabase, pool } = require('./utils/db')

const port = Number(process.env.PORT || 3003)

initializeDatabase()
  .then(() => {
    app.listen(port, () => console.log(`Backend listening on port ${port}`))
  })
  .catch(async (error) => {
    console.error('Could not initialize PostgreSQL:', error.message)
    await pool.end()
    process.exitCode = 1
  })
