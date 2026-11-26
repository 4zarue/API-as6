import { describe, test, beforeEach, afterEach } from "node:test"
import assert from "node:assert/strict"
import request from "supertest"
import app from "../src/app.js"

beforeEach(() => {
    // Setup code before each test, if needed
})
afterEach(() => {
    // Cleanup code after each test, if needed
})

describe('GET /users', () => {
    test('reponds with 200 and JSON', async () => {
        const res = await request(app)
            .get('/users')
            .expect('Content-Type', /json/i)
            .expect(200)
        assert.ok(Array.isArray(res.body))
    })
})

describe('GET /users/:id', () => {
    test('responds with 200 and the uder object for existin user', async () => {
        const users = await request(app)
            .get('/users')
            .expect(200)

        const alice = users.body.find(user => user.name === 'Alice')
        
        assert(alice, 'Alice should exist in the users list')
        const res = await request(app)
            .get(`/users/${alice.id}`)
            .expect('Content-Type', /json/i)
            .expect(200) 
        assert.deepStrictEqual(res.body, alice)
    })

    test('responds with 404 for non-existing user', async () => {
        await request(app)
            .get('/users/9999999')
            .expect(404)
    })
})

    // the most common status codes
    // 200 OK: The request was successful, and the server returned the requested data.
    // 201 Created: The request was successful, and a new resource was created as a result.
    // 400 Bad Request: The server could not understand the request due to invalid syntax.
    // 401 Unauthorized: The client must authenticate itself to get the requested response.
    // 403 Forbidden: The client does not have access rights to the content.
    // 404 Not Found: The server can not find the requested resource.
    // 500 Internal Server Error: The server has encountered a situation it doesn't know how to handle.

describe('Todos API', () => {
    test('GET /todos returns todos and supports state filtering', async () => {
        const all = await request(app).get('/todos').expect(200)
        assert.equal(all.body.length, 2)
        const filtered = await request(app).get('/todos?state=todo').expect(200)
        assert.equal(filtered.body.length, 2)
    })

    test('GET /todos/:id returns a todo or 404', async () => {
        const todos = await request(app).get('/todos').expect(200)
        const found = await request(app).get(`/todos/${todos.body[0].id}`).expect(200)
        assert.equal(found.body.id, todos.body[0].id)
        await request(app).get('/todos/missing').expect(404)
    })

    test('POST /todos creates a todo and rejects invalid input', async () => {
        const res = await request(app).post('/todos')
            .send({ title: 'New task', description: 'Description', state: 'todo' })
            .expect(201)
        assert.equal(res.body.title, 'New task')
        assert.ok(res.body.id)

        await request(app).post('/todos').send({ title: '  ' }).expect(400)
    })

    test('PUT /todos/:id updates a todo and handles errors', async () => {
        const todos = await request(app).get('/todos').expect(200)
        const id = todos.body[0].id
        const updated = await request(app).put(`/todos/${id}`)
            .send({ title: 'Changed title' }).expect(200)
        assert.equal(updated.body.title, 'Changed title')

        await request(app).put('/todos/missing').send({ title: 'Changed' }).expect(404)
        await request(app).put(`/todos/${id}`).send({ unknown: true }).expect(400)
    })
})

describe('Authentication API', () => {
    test('POST /auth returns a token for valid credentials', async () => {
        const res = await request(app).post('/auth')
            .send({ username: 'pk', password: 'kissa' }).expect(200)
        assert.equal(res.body.token_type, 'Bearer')
        assert.ok(res.body.access_token)
    })

    test('POST /auth rejects missing and invalid credentials', async () => {
        await request(app).post('/auth').send({ username: 'pk' }).expect(400)
        await request(app).post('/auth')
            .send({ username: 'pk', password: 'wrong' }).expect(401)
    })
})

describe('Todo content negotiation and DELETE', () => {
    test('GET /todos returns CSV when Accept is text/csv', async () => {
        const res = await request(app)
            .get('/todos?state=todo')
            .set('Accept', 'text/csv')
            .expect(200)
            .expect('Content-Type', /text\/csv/)
        assert.match(res.text, /^id,title,description,state,createdAt,updatedAt/)
        assert.match(res.text, /Find some literature on express/)
    })

    test('GET /todos returns JSON when Accept is application/json', async () => {
        const res = await request(app)
            .get('/todos')
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        assert.ok(Array.isArray(res.body))
    })

    test('GET /todos returns 406 for an unsupported Accept type', async () => {
        await request(app)
            .get('/todos')
            .set('Accept', 'application/xml')
            .expect(406)
    })

    test('DELETE /todos/:id deletes an existing todo and returns 404 when missing', async () => {
        const todos = await request(app).get('/todos').expect(200)
        const id = todos.body[0].id
        await request(app).delete(`/todos/${id}`).expect(204)
        await request(app).get(`/todos/${id}`).expect(404)
        await request(app).delete('/todos/missing').expect(404)
    })
})