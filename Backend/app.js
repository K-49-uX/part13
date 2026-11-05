const express = require('express')
const blogsRouter = require('./controllers/blogs')
const authorsRouter = require('./controllers/authors')
const usersRouter = require('./controllers/users')
const readingListsRouter = require('./controllers/readinglists')
const loginRouter = require('./controllers/login')
const logoutRouter = require('./controllers/logout')
const { pool } = require('./utils/db')
const { TESTING } = require('./utils/config')
const { errorHandler } = require('./utils/middleware')

const app = express()

app.use(express.json())
app.get('/', (req, res) => res.status(200).send('Blog API is running'))
app.get('/health', (req, res) => res.json({ status: 'ok' }))
app.post('/api/reset', async (req, res) => {
  if (!TESTING) return res.status(404).json({ error: 'unknown endpoint' })
  await pool.query('TRUNCATE TABLE blogs, users RESTART IDENTITY CASCADE')
  res.status(204).end()
})
app.use('/api/blogs', blogsRouter)
app.use('/api/authors', authorsRouter)
app.use('/api/users', usersRouter)
app.use('/api/readinglists', readingListsRouter)
app.use('/api/login', loginRouter)
app.use('/api/logout', logoutRouter)

app.use((req, res) => res.status(404).json({ error: 'unknown endpoint' }))
app.use(errorHandler)

module.exports = app
