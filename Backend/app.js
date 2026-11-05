const express = require('express')
const blogsRouter = require('./controllers/blogs')
const authorsRouter = require('./controllers/authors')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const { errorHandler } = require('./utils/middleware')

const app = express()

app.use(express.json())
app.get('/health', (req, res) => res.json({ status: 'ok' }))
app.use('/api/blogs', blogsRouter)
app.use('/api/authors', authorsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

app.use((req, res) => res.status(404).json({ error: 'unknown endpoint' }))
app.use(errorHandler)

module.exports = app
