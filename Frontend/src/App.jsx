import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import Blogs from './components/Blogs'
import Login from './components/Login'
import BlogView from './components/BlogView'
import CreateBlog from './components/CreateBlog'
import blogService from './services/blogs'
import styled from 'styled-components'

const Container = styled.div`padding: 12px;`
const NavBar = styled.nav`margin-bottom:12px; a { margin-right:8px; text-decoration:none; color:#1976d2; }`
const UserInfo = styled.span`margin-left:10px;`
const Notification = styled.div`background: #fff3cd; border: 1px solid #ffeeba; padding: 8px; margin-bottom: 12px; border-radius: 6px;`

const App = () => {
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState(null)
  const [blogs, setBlogs] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    blogService.getAll()
      .then(setBlogs)
      .catch(() => setNotification('Could not load blogs. Check that the backend and database are available.'))
    const logged = window.localStorage.getItem('loggedBlogappUser')
    if (logged) {
      const u = JSON.parse(logged)
      setUser(u)
      blogService.setToken(u.token)
    }
  }, [])

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
    setNotification('logged out')
    setTimeout(() => setNotification(null), 3000)
    navigate('/')
  }

  const addBlog = async (blog) => {
    const created = await blogService.create(blog)
    setBlogs(blogs.concat(created))
    navigate('/')
  }

  const updateBlog = (id, updated) => {
    setBlogs(blogs.map(b => (b.id === id ? updated : b)))
  }

  const removeBlog = async (id) => {
    await blogService.remove(id)
    setBlogs(blogs.filter(b => b.id !== id))
    navigate('/')
  }

  return (
    <Container>
      <NavBar>
        <Link to="/">blogs</Link>
        {user && <Link to="/create">create</Link>}
        {!user && <Link to="/login">login</Link>}
        {user && (
          <UserInfo>
            {user.name} logged in <button onClick={handleLogout}>logout</button>
          </UserInfo>
        )}
      </NavBar>

      {notification && <Notification>{notification}</Notification>}

      <Routes>
        <Route path="/" element={<Blogs blogs={blogs} user={user} updateBlog={updateBlog} removeBlog={removeBlog} />} />
        <Route path="/login" element={<Login setUser={setUser} setNotification={setNotification} />} />
        <Route path="/blogs/:id" element={<BlogView user={user} updateBlog={updateBlog} removeBlog={removeBlog} />} />
        <Route path="/create" element={user ? <CreateBlog addBlog={addBlog} /> : <Navigate replace to="/login" />} />
      </Routes>
    </Container>
  )
}

export default App
