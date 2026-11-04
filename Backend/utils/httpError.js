const httpError = (status, message) => {
  const messages = Array.isArray(message) ? message : null
  const error = new Error(messages ? messages[0] : message)
  error.status = status
  if (messages) error.errors = messages
  return error
}

module.exports = httpError
