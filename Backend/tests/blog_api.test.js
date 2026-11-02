const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

let token

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('sekret', 10)
  await new User({ username: 'root', name: 'Superuser', passwordHash }).save()
  await Blog.insertMany(helper.initialBlogs)

  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'root', password: 'sekret' })
  token = loginResponse.body.token
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('returned blogs use id instead of _id', async () => {
  const response = await api.get('/api/blogs')
  for (const blog of response.body) {
    assert.ok(blog.id, 'blog.id should be defined')
    assert.strictEqual(blog._id, undefined)
  }
})

test('a valid blog can be added with POST', async () => {
  const newBlog = {
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

  const titles = blogsAtEnd.map((b) => b.title)
  assert.ok(titles.includes('Type wars'))
})

test('if likes is missing it defaults to 0', async () => {
  const newBlog = {
    title: 'No likes blog',
    author: 'Anon',
    url: 'http://example.com/no-likes',
  }

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, 0)
})

test('blog without title is not added (400)', async () => {
  const newBlog = {
    author: 'No Title',
    url: 'http://example.com/no-title',
    likes: 1,
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

test('blog without url is not added (400)', async () => {
  const newBlog = {
    title: 'No URL',
    author: 'No URL',
    likes: 1,
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

test('adding a blog without token returns 401', async () => {
  const newBlog = {
    title: 'No token',
    author: 'Anonymous',
    url: 'http://example.com/no-token',
    likes: 0,
  }

  await api.post('/api/blogs').send(newBlog).expect(401)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

test('adding a blog with invalid token returns 401', async () => {
  const newBlog = {
    title: 'Bad token',
    author: 'Anon',
    url: 'http://example.com/bad-token',
    likes: 0,
  }

  await api
    .post('/api/blogs')
    .set('Authorization', 'Bearer this-is-not-a-real-token')
    .send(newBlog)
    .expect(401)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

test('a blog created by the user can be deleted by that user', async () => {
  const newBlog = {
    title: 'To be deleted',
    author: 'Owner',
    url: 'http://example.com/del',
    likes: 0,
  }

  const created = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)

  const blogsBeforeDelete = await helper.blogsInDb()

  await api
    .delete(`/api/blogs/${created.body.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, blogsBeforeDelete.length - 1)

  const titles = blogsAtEnd.map((b) => b.title)
  assert.ok(!titles.includes(newBlog.title))
})

test('deleting without token returns 401', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api.delete(`/api/blogs/${blogToDelete.id}`).expect(401)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
})

test('deleting another user\'s blog returns 401', async () => {
  // create a blog owned by root
  const created = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Roots blog',
      author: 'Root',
      url: 'http://example.com/root',
      likes: 0,
    })
    .expect(201)

  // create a different user and login
  const passwordHash = await bcrypt.hash('hunter2', 10)
  await new User({
    username: 'other',
    name: 'Other',
    passwordHash,
  }).save()

  const otherLogin = await api
    .post('/api/login')
    .send({ username: 'other', password: 'hunter2' })
  const otherToken = otherLogin.body.token

  await api
    .delete(`/api/blogs/${created.body.id}`)
    .set('Authorization', `Bearer ${otherToken}`)
    .expect(401)
})

test('deleting with malformed id returns 400', async () => {
  await api
    .delete('/api/blogs/not-a-real-id')
    .set('Authorization', `Bearer ${token}`)
    .expect(400)
})

test('a blog can be updated (likes)', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToUpdate = blogsAtStart[0]

  const updatedData = { ...blogToUpdate, likes: blogToUpdate.likes + 100 }

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedData)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, blogToUpdate.likes + 100)

  const blogsAtEnd = await helper.blogsInDb()
  const refetched = blogsAtEnd.find((b) => b.id === blogToUpdate.id)
  assert.strictEqual(refetched.likes, blogToUpdate.likes + 100)
})

test('updating non-existent id returns 404', async () => {
  const id = await helper.nonExistingId()
  await api.put(`/api/blogs/${id}`).send({ likes: 999 }).expect(404)
})

test('updating with malformed id returns 400', async () => {
  await api.put('/api/blogs/not-a-real-id').send({ likes: 1 }).expect(400)
})

after(async () => {
  await mongoose.connection.close()
})
