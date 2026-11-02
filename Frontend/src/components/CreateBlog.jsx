import React, { useState } from 'react'
import styled from 'styled-components'

const Container = styled.div`
  max-width: 520px;
  margin: 24px auto;
  padding: 18px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(7, 59, 76, 0.06);
`
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`
const Input = styled.input`
  padding: 9px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
`
const Button = styled.button`
  padding: 9px 12px;
  border: 0;
  border-radius: 6px;
  background: #1976d2;
  color: white;
  cursor: pointer;
`

const CreateBlog = ({ addBlog }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    await addBlog({ title, author, url })
  }

  return (
    <Container>
      <h2>create blog</h2>
      <Form onSubmit={submit}>
        <Input aria-label="title" placeholder="title" value={title} onChange={event => setTitle(event.target.value)} required />
        <Input aria-label="author" placeholder="author" value={author} onChange={event => setAuthor(event.target.value)} />
        <Input aria-label="url" placeholder="url" type="url" value={url} onChange={event => setUrl(event.target.value)} required />
        <Button type="submit">create</Button>
      </Form>
    </Container>
  )
}

export default CreateBlog
