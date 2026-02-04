const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;
const SECRET_KEY = 'helter_skelter_secret_key';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// --- DATABASE ---
let usersDB = [
    { discord_id: '9988776655', username: 'Itayra', balance: 5000, game_rank: 'SSS', role: 'admin', password: 'admin' },
    { discord_id: '1122334455', username: 'Test1', balance: 1500, game_rank: 'S', role: 'member', password: '123' },
    { discord_id: '5566778899', username: 'Test2', balance: 200, game_rank: 'C', role: 'member', password: '123' }
];

// --- MIDDLEWARE ---
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admins only!' });
    }
    next();
}

// --- API ROUTES ---

// 1. LOGIN
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = usersDB.find(u => u.username === username && u.password === password);

    if (user) {
        const token = jwt.sign({ username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, role: user.role });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// 2. PROFILE
app.get('/api/profile', authenticateToken, (req, res) => {
    // Шукаємо користувача по імені з токена
    const user = usersDB.find(u => u.username === req.user.username);
    if (user) {
        res.json(user); // Віддає всю інфу (баланс, ранг...)
    } else {
        res.sendStatus(404);
    }
});

// 3. GET ALL (Для адмін панелі)
app.get('/api/users', (req, res) => {
    res.json(usersDB);
});

// 4. CRUD (Для адмінів)
app.post('/api/users', authenticateToken, requireAdmin, (req, res) => {
    const newUser = {
        discord_id: req.body.discord_id || Date.now().toString().slice(-10),
        username: req.body.username || 'New_User',
        balance: parseInt(req.body.balance) || 0,
        game_rank: 'Recruit',
        role: 'member',
        password: '123'
    };
    usersDB.push(newUser);
    res.status(201).json(newUser);
});

app.put('/api/users/:id', authenticateToken, requireAdmin, (req, res) => {
    const { id } = req.params;
    const { balance } = req.body;
    const userIndex = usersDB.findIndex(u => u.discord_id === id);
    
    if (userIndex !== -1) {
        usersDB[userIndex].balance = parseInt(balance);
        res.json(usersDB[userIndex]);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

app.delete('/api/users/:id', authenticateToken, requireAdmin, (req, res) => {
    const { id } = req.params;
    usersDB = usersDB.filter(user => user.discord_id !== id);
    res.json({ message: 'Deleted' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});