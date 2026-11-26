import express from 'express'
import {
    getTodos, getTodoById, createTodo, updateTodo, deleteTodo, toCsv
} from '../services/todos.js'

const router = express.Router()

router.get('/', (req, res) => {
    const format = req.accepts(['application/json', 'text/csv'])
    if (!format) {
        return res.status(406).json({ error: 'Supported formats are application/json and text/csv' })
    }

    const todos = getTodos(req.query.state)
    if (format === 'text/csv') {
        return res.type('text/csv').send(toCsv(todos))
    }
    return res.json(todos)
})

router.get('/:id', (req, res) => {
    const todo = getTodoById(req.params.id)
    if (!todo) return res.status(404).json({ error: 'Todo not found' })
    return res.json(todo)
})

router.post('/', (req, res) => {
    const todo = createTodo(req.body)
    if (!todo) return res.status(400).json({ error: 'Invalid todo' })
    return res.status(201).json(todo)
})

router.put('/:id', (req, res) => {
    const { id } = req.params
    if (!getTodoById(id)) return res.status(404).json({ error: 'Todo not found' })

    const todo = updateTodo(id, req.body)
    if (!todo) return res.status(400).json({ error: 'Invalid todo update' })
    return res.json(todo)
})

router.delete('/:id', (req, res) => {
    if (!deleteTodo(req.params.id)) {
        return res.status(404).json({ error: 'Todo not found' })
    }
    return res.status(204).end()
})

export default router
