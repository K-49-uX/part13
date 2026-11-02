import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import blogService from '../services/blogs'
import styled from 'styled-components'

const Container = styled.div`
  max-width: 760px; margin:24px auto; padding:18px; background:linear-gradient(180deg,#fff,#fbfdff);
  border-radius:10px; box-shadow:0 10px 30px rgba(7,59,76,0.04);
`
const Title = styled.h2`margin-bottom:10px; color:#073b4c;`
const Url = styled.div`margin-bottom:12px; color:#0366d6; font-size:0.98rem;`
const Actions = styled.div`display:flex; gap:12px; align-items:center; margin-top:12px;`
const Button = styled.button`
  padding:8px 12px; border-radius:8px; border:none; cursor:pointer; font-weight:600;
  background: ${props => props.variant === 'danger' ? '#d32f2f' : '#1976d2'};
  color: white; box-shadow:0 4px 12px rgba(25,118,210,0.08);
`

const BlogView = ({ user, updateBlog, removeBlog }) => {
  const { id } = useParams()
  const [blog, setBlog] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      const b = await blogService.getById(id)
      setBlog(b)
    }
    fetch()
  }, [id])

  const handleLike = async () => {
    if (!user) return
    const updated = { ...blog, likes: (blog.likes || 0) + 1 }
    const res = await blogService.update(blog.id, updated)
    setBlog(res)
    if (updateBlog) updateBlog(blog.id, res)
  }

  const handleRemove = async () => {
    if (!removeBlog) return
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)) {
      removeBlog(blog.id)
    }
  }

  if (!blog) return <Container>loading...</Container>

  const getId = u => (typeof u === 'string' ? u : (u && (u.id || u._id || (u.username ? null : u))))
  const canRemove = Boolean(
    blog.user && user && (
      (blog.user.username && user.username && blog.user.username === user.username) ||
      (getId(blog.user) && (getId(blog.user) === getId(user)))
    )
  )

  return (
    <Container>
      <Title>{blog.title} {blog.author}</Title>
      <Url>{blog.url}</Url>
      <div>likes {blog.likes}</div>
      <Actions>
        {user && <Button onClick={handleLike}>like</Button>}
        {canRemove && <Button variant="danger" onClick={handleRemove}>remove</Button>}
      </Actions>
      <div style={{ marginTop: 12 }}>{blog.user && (blog.user.name || blog.user)}</div>
    </Container>
  )
}

export default BlogView
