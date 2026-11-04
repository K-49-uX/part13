require('./utils/config')

const { pool } = require('./utils/db')

const printBlogs = async () => {
  try {
    const { rows } = await pool.query(
      'SELECT author, title, likes FROM blogs ORDER BY id'
    )

    if (rows.length === 0) {
      console.log('No blogs found.')
      return
    }

    for (const blog of rows) {
      const author = blog.author || 'Unknown author'
      console.log(`${author}: '${blog.title}', ${blog.likes} likes`)
    }
  } catch (error) {
    console.error(`Could not load blogs: ${error.message}`)
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}

printBlogs()
