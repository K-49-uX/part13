import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import blogService from '../services/blogs'
import styled from 'styled-components'

const List = styled.div`
  max-width: 760px; margin:20px auto;
`

const Item = styled.div`
  display:flex; justify-content:space-between; align-items:center;
  padding:12px 16px; border-bottom:1px solid #eef4fb; background:#fff; border-radius:8px; margin-bottom:10px;
  transition: box-shadow .12s ease;
  &:hover{ box-shadow:0 8px 26px rgba(3,102,214,0.06); }
`

const Left = styled.div`max-width:75%;`
const Right = styled.div``
const TitleLink = styled(Link)`font-weight:600; color:#05386b; text-decoration:none; &:hover{ text-decoration:underline }`
const Url = styled.div`margin-top:6px; color:#0366d6; font-size:0.95rem;`
const Meta = styled.div`margin-top:8px; font-size:0.92rem; color:#333; display:flex; gap:8px; align-items:center;`
const Btn = styled.button`
  background:#0b63b8; color:white; border:none; padding:6px 10px; border-radius:8px; cursor:pointer; font-weight:600;
  &:hover{ background:#094f92 }
`
const Danger = styled(Btn)`background:#c62828; &:hover{ background:#a52121 }`

const Blogs = ({ blogs = [], user, updateBlog, removeBlog }) => {
  return (
    <List>
      {blogs.map(b => (
        <BlogItem key={b.id} blog={b} user={user} updateBlog={updateBlog} removeBlog={removeBlog} />
      ))}
    </List>
  )
}

const BlogItem = ({ blog, user, updateBlog, removeBlog }) => {
  const [open, setOpen] = useState(false)

  const handleLike = async () => {
    const updated = { ...blog, likes: (blog.likes || 0) + 1 }
    const res = await blogService.update(blog.id, updated)
    if (updateBlog) updateBlog(blog.id, res)
  }

  const handleRemove = async () => {
    if (!window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)) return
    if (removeBlog) removeBlog(blog.id)
    else await blogService.remove(blog.id)
  }

  const getId = u => (typeof u === 'string' ? u : (u && (u.id || u._id || (u.username ? null : u))))
  const canRemove = Boolean(
    blog.user && user && (
      (blog.user.username && user.username && blog.user.username === user.username) ||
      (getId(blog.user) && (getId(blog.user) === getId(user)))
    )
  )

  return (
    <Item className="blog">
      <Left>
        <TitleLink to={`/blogs/${blog.id}`}>{blog.title} {blog.author}</TitleLink>
        {open && (
          <div>
            <Url><a href={blog.url}>{blog.url}</a></Url>
            <Meta>likes {blog.likes || 0} <Btn onClick={handleLike}>like</Btn> {canRemove && <Danger onClick={handleRemove}>remove</Danger>}</Meta>
          </div>
        )}
      </Left>
      <Right>
        <Btn onClick={() => setOpen(!open)}>{open ? 'hide' : 'view'}</Btn>
      </Right>
    </Item>
  )
}

export default Blogs
