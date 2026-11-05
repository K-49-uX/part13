const express = require('express')
const { Session } = require('../models')
const { getAuthenticatedUser, getBearerToken } = require('../utils/auth')
const httpError = require('../utils/httpError')

const router = express.Router()

router.delete('/', async (req, res) => {
  const user = await getAuthenticatedUser(req)
  if (!user) throw httpError(401, 'token missing, invalid, expired, or revoked')
  await Session.deleteByToken(getBearerToken(req))
  res.status(204).end()
})

module.exports = router
