const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', name: 'Superuser', passwordHash })
  await user.save()
})

test('creation succeeds with a fresh username', async () => {
  const usersAtStart = await helper.usersInDb()

  const newUser = {
    username: 'mluukkai',
    name: 'Matti Luukkainen',
    password: 'salainen',
  }

  await api
    .post('/api/users')
    .send(newUser)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const usersAtEnd = await helper.usersInDb()
  assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

  const usernames = usersAtEnd.map((u) => u.username)
  assert.ok(usernames.includes(newUser.username))
})

test('all users are returned by GET /api/users', async () => {
  const response = await api
    .get('/api/users')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.length, 1)
  assert.strictEqual(response.body[0].username, 'root')
  assert.strictEqual(response.body[0].passwordHash, undefined)
})

test('creation fails with status 400 if username already taken', async () => {
  const usersAtStart = await helper.usersInDb()

  const newUser = {
    username: 'root',
    name: 'Duplicate',
    password: 'salainen',
  }

  const result = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  assert.match(result.body.error, /unique/)

  const usersAtEnd = await helper.usersInDb()
  assert.strictEqual(usersAtEnd.length, usersAtStart.length)
})

test('creation fails with status 400 if username shorter than 3 chars', async () => {
  const usersAtStart = await helper.usersInDb()

  const newUser = { username: 'ab', name: 'Short', password: 'salainen' }

  const result = await api.post('/api/users').send(newUser).expect(400)
  assert.match(result.body.error, /username|shorter|minimum|min length|3/i)

  const usersAtEnd = await helper.usersInDb()
  assert.strictEqual(usersAtEnd.length, usersAtStart.length)
})

test('creation fails with status 400 if password shorter than 3 chars', async () => {
  const usersAtStart = await helper.usersInDb()

  const newUser = { username: 'validname', name: 'Short pw', password: 'ab' }

  const result = await api.post('/api/users').send(newUser).expect(400)
  assert.match(result.body.error, /password/i)

  const usersAtEnd = await helper.usersInDb()
  assert.strictEqual(usersAtEnd.length, usersAtStart.length)
})

test('creation fails with status 400 if username missing', async () => {
  const newUser = { name: 'No name', password: 'salainen' }
  await api.post('/api/users').send(newUser).expect(400)
})

test('creation fails with status 400 if password missing', async () => {
  const newUser = { username: 'noPw', name: 'No pw' }
  await api.post('/api/users').send(newUser).expect(400)
})

test('login succeeds with correct credentials and returns a token', async () => {
  const response = await api
    .post('/api/login')
    .send({ username: 'root', password: 'sekret' })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.ok(response.body.token, 'token should be returned')
  assert.strictEqual(response.body.username, 'root')
})

test('login fails with 401 on wrong password', async () => {
  await api
    .post('/api/login')
    .send({ username: 'root', password: 'wrong' })
    .expect(401)
})

test('login fails with 401 on unknown username', async () => {
  await api
    .post('/api/login')
    .send({ username: 'nobody', password: 'whatever' })
    .expect(401)
})

after(async () => {
  await mongoose.connection.close()
})
