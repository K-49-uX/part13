const path = require('node:path')

require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true })

module.exports = {
  DATABASE_URL: process.env.DATABASE_URL,
  PORT: Number(process.env.PORT || 3003),
  PGSSL: process.env.PGSSL === 'true',
  JWT_SECRET: process.env.JWT_SECRET,
}
