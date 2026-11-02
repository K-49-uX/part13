const app = require('./app')
const config = require('./utils/config')
const logger = require('./utils/logger')

app.locals.databaseConnection.then((connected) => {
  if (!connected) {
    logger.error('API server not started because MongoDB is unavailable')
    process.exit(1)
  }

  app.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`)
  })
})
