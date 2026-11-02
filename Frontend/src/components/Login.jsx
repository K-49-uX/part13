import React, { useState } from 'react'
import loginService from '../services/login'
import blogService from '../services/blogs'
import styled from 'styled-components'

const Container = styled.div`max-width:420px;margin:24px auto;padding:16px;background:white;border-radius:8px;box-shadow:0 6px 16px rgba(0,0,0,0.04);`
const Form = styled.form`display:flex;flex-direction:column;gap:8px;`
const Input = styled.input`padding:8px;border-radius:6px;border:1px solid #ddd;`
const Button = styled.button`padding:8px;border-radius:6px;border:none;background:#1976d2;color:white;cursor:pointer;`

const Login = ({ setUser, setNotification }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      setNotification('welcome back!')
      setTimeout(() => setNotification(null), 3000)
    } catch (error) {
      const message = error.response?.status === 401
        ? 'wrong credentials'
        : 'Login failed. Check that the backend and database are available.'
      setNotification(message)
      setTimeout(() => setNotification(null), 3000)
    }
  }

  return (
    <Container>
      <h2>login</h2>
      <Form onSubmit={handleLogin}>
        <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="username" />
        <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" />
        <Button type="submit">login</Button>
      </Form>
    </Container>
  )
}

export default Login
