import express from 'express'
import openapiSpecification from './openapi.json' with { type: 'json' }
import { loginLimiter } from './middleware/rate-limiters.js'
import indexRouter from './routes/index.js'
import usersRouter from './routes/users.js'
import todosRouter from './routes/todos.js'
import authRouter from './routes/auth.js'

const app = express()

// support for json
app.use(express.json())

app.use((req, res, next) => {
  req.cookies = Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map(part => {
    const [key, ...value] = part.trim().split('=')
    return [key, decodeURIComponent(value.join('='))]
  }))
  next()
})

// Serve the OpenAPI specification and an interactive Swagger UI page.
app.get('/openapi.json', (req, res) => res.json(openapiSpecification))
app.get('/doc', (req, res) => res.type('html').send(`<!doctype html>
<html><head><title>Todo API Documentation</title><link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"></head>
<body><div id="swagger-ui"></div><script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>SwaggerUIBundle({url:'/openapi.json',dom_id:'#swagger-ui'})</script></body></html>`))

// define handlers for various routes
app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/todos', todosRouter)
app.use('/auth', loginLimiter, authRouter)

// export the app object to server.js where we referred to this
export default app
