const express = require('express')
const { Blog } = require('../models')

const router = express.Router()

router.get('/', async (req, res) => {
  res.json(await Blog.getAuthors())
})

module.exports = router
