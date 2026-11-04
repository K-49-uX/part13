const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error)

  let status = error.status || 500
  let message = status < 500 ? error.message : 'internal server error'

  if (error.type === 'entity.parse.failed') {
    status = 400
    message = 'invalid JSON'
  } else if (['23502', '23503', '23505', '23514', '22P02'].includes(error.code)) {
    status = 400
    message = 'request violates a database constraint'
  }

  if (status >= 500) console.error(error)
  res.status(status).json({ error: message })
}

module.exports = { errorHandler }
