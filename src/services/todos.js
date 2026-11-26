import { v4 as uuidv4 } from 'uuid'

const VALID_STATES = ['todo', 'doing', 'done']

const initialTodos = () => {
    const now = new Date()
    return [
        {
            id: uuidv4(), 
            title: 'Find some literature on express',
            description: 'etc.',
            state: 'todo',
            createdAt: now,
            updatedAt: now
        },
        {
            id: uuidv4(), 
            title: 'Study HTTP basics',
            description: 'verbs headers etc.',
            state: 'todo',
            createdAt: now,
            updatedAt: now
        }
    ]
}

let todos = initialTodos()

export function getTodos(state) {
    if (typeof state === 'string') {
        return todos.filter(todo => todo.state === state)
    }
    return todos
}

export function getTodoById(id) {
    return todos.find(todo => todo.id === id)
}

export function createTodo(input = {}) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        return null
    }

    const { title, description = '', state = 'todo' } = input
    if (typeof title !== 'string' || !title.trim()) {
        return null
    }
    if (typeof description !== 'string' || typeof state !== 'string' || !VALID_STATES.includes(state)) {
        return null
    }

    const now = new Date().toISOString()
    const todo = {
        id: uuidv4(),
        title: title.trim(),
        description,
        state,
        createdAt: now,
        updatedAt: now
    }
    todos.push(todo)
    return todo
}

export function updateTodo(id, updates) {
    const todo = getTodoById(id)
    if (!todo) return null
    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) return null

    const allowed = ['title', 'description', 'state']
    for (const key of Object.keys(updates)) {
        if (!allowed.includes(key)) return null
    }
    if ('title' in updates && (typeof updates.title !== 'string' || !updates.title.trim())) return null
    if ('description' in updates && typeof updates.description !== 'string') return null
    if ('state' in updates && !VALID_STATES.includes(updates.state)) return null

    Object.assign(todo, updates)
    if (typeof todo.title === 'string') todo.title = todo.title.trim()
    todo.updatedAt = new Date().toISOString()
    return todo
}

// Used to keep tests independent from each other.
export function resetTodos() {
    todos = initialTodos()
}

export function deleteTodo(id) {
    const index = todos.findIndex(todo => todo.id === id)
    if (index === -1) return false
    todos.splice(index, 1)
    return true
}

export function toCsv(items) {
    const headers = ['id', 'title', 'description', 'state', 'createdAt', 'updatedAt']
    const rows = items.map(todo => headers.map(key => {
        const value = todo[key] ?? ''
        return `"${String(value).replaceAll('"', '""')}"`
    }).join(','))
    return [headers.join(','), ...rows].join('\n')
}