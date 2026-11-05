const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('./config')
const Session = require('../models/session')

const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60

const secret = () => {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not set; configure it in Backend/.env')
  return JWT_SECRET
}

const createToken = (user) => jwt.sign(
  { id: user.id, username: user.username },
  secret(),
  { expiresIn: TOKEN_TTL_SECONDS }
)

const getBearerToken = (req) => {
  const authorization = req.get('authorization')
  if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) return null
  return authorization.slice(7).trim() || null
}

const getAuthenticatedUser = async (req) => {
  const token = getBearerToken(req)
  if (!token) return null
  let user
  try {
    user = jwt.verify(token, secret())
  } catch {
    return null
  }
  if (!await Session.isValid({ userId: user.id, token })) return null
  return user
}

module.exports = { createToken, getBearerToken, getAuthenticatedUser, TOKEN_TTL_SECONDS }
