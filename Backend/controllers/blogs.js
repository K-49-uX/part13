const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id).populate('user', {
      username: 1,
      name: 1,
    })
    if (!blog) {
      return response.status(404).json({ error: 'blog not found' })
    }
    response.json(blog)
  } catch (error) {
    next(error)
  }
})

blogsRouter.post('/', userExtractor, async (request, response, next) => {
  try {
    const user = request.user

    const blog = new Blog({
      ...request.body,
      user: user._id,
    })

    const result = await blog.save()
    user.blogs = user.blogs.concat(result._id)
    await user.save()
    response.status(201).json(result)
  } catch (error) {
    next(error)
  }
})

blogsRouter.delete('/:id', userExtractor, async (request, response, next) => {
  try {
    const user = request.user
    const blog = await Blog.findById(request.params.id)
    if (!blog) {
      return response.status(204).end()
    }

    if (blog.user && blog.user.toString() !== user._id.toString()) {
      return response
        .status(401)
        .json({ error: 'only the creator can delete this blog' })
    }

    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
  const { title, author, url, likes } = request.body

  try {
    const updated = await Blog.findByIdAndUpdate(
      request.params.id,
      { title, author, url, likes },
      { returnDocument: 'after', runValidators: true, context: 'query' }
    )
    if (!updated) {
      return response.status(404).end()
    }
    response.json(updated)
  } catch (error) {
    next(error)
  }
})

module.exports = blogsRouter
