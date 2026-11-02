const jwt = require('jsonwebtoken')

const secret = () => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set; configure it in Backend/.env')
  return process.env.JWT_SECRET
}

const createToken = (user) => jwt.sign({ id: user.id, username: user.username }, secret(), { expiresIn: '7d' })

const getAuthenticatedUser = (req) => {
  const authorization = req.get('authorization')
  if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) return null
  try {
    return jwt.verify(authorization.slice(7), secret())
  } catch {
    return null
  }
}

module.exports = { createToken, getAuthenticatedUser }
