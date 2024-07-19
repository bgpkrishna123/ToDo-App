require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
//p
const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }
});

app.use(cors());
app.use(express.json());

const users = [];
const tasks = [];
const JWT_SECRET = process.env.secretKey;

app.get('/', (req, res) => {
    res.send('Welcome to the To-Do API');
});

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = users.find(user => user.username === username);
        if (existingUser) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        users.push({ username, password: hashedPassword });
        res.status(201).json({ msg: 'User registered', username });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).send('An error occurred while registering the user');
    }
});

app.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;
        const user = users.find(item => item.username === username);
        if (user && bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('An error occurred while logging in');
    }
});

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).send('Access denied. No token provided.');

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).send('Invalid token');
    }
};

app.get('/tasks', authenticate, (req, res) => {
    res.json(tasks);
});

app.post('/tasks', authenticate, (req, res) => {
    const task = { 
        id: tasks.length + 1, 
        name: req.body.name, 
        status: req.body.status || 'pending' 
    };
    tasks.push(task);
    io.emit('taskAdded', task);
    res.status(201).json(task);
});

app.put('/tasks/:id', authenticate, (req, res) => {
    const task = tasks.find(t => t.id === parseInt(req.params.id));
    if (task) {
        Object.assign(task, req.body);
        io.emit('taskUpdated', task);
        res.json(task);
    } else {
        res.status(404).send('Task not found');
    }
});

app.delete('/tasks/:id', authenticate, (req, res) => {
    const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id));
    if (taskIndex !== -1) {
        const [task] = tasks.splice(taskIndex, 1);
        io.emit('taskDeleted', task);
        res.json("Task deleted successfully");
    } else {
        res.status(404).send('Task not found');
    }
});

io.on('connection', socket => {
    console.log('New client connected');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(port, () => console.log(`Server listening on ${port}`));
