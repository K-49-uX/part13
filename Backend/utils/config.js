const path = require('node:path')

require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true })

module.exports = {
  TESTING: process.env.TESTING === 'true',
  DATABASE_URL: process.env.TESTING === 'true'
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL,
  PORT: Number(process.env.PORT || (process.env.TESTING === 'true' ? 3001 : 3003)),
  PGSSL: process.env.PGSSL === 'true',
  JWT_SECRET: process.env.JWT_SECRET,
}
