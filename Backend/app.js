const express = require('express')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

const app = express()

app.use(express.json())
app.get('/health', (req, res) => res.json({ status: 'ok' }))
app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

app.use((req, res) => res.status(404).json({ error: 'unknown endpoint' }))
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error)
  console.error(error)
  if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'invalid JSON' })
  res.status(500).json({ error: 'internal server error' })
})

module.exports = app
