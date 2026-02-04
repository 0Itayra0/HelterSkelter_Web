const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Роздає html файли

let usersDB = [
    { discord_id: '9988776655', username: 'Yoshimura', balance: 5000, game_rank: 'SSS' },
    { discord_id: '1122334455', username: 'Test1', balance: 1500, game_rank: 'S' },
    { discord_id: '5566778899', username: 'Test2', balance: 200, game_rank: 'C' },
];

// 1. GET: Отримати всіх користувачів
app.get('/api/users', (req, res) => {
    res.json(usersDB);
});

// 2. POST: Створити нового користувача
app.post('/api/users', (req, res) => {
    const newUser = {
        discord_id: req.body.discord_id || Date.now().toString(), // Генеруємо ID якщо немає
        username: req.body.username,
        balance: req.body.balance,
        game_rank: 'Recruit' // Дефолтний ранг
    };
    usersDB.push(newUser); // Додаємо в масив
    res.status(201).json(newUser);
});

// 3. DELETE: Видалити користувача
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    // Фільтруємо масив, залишаючи всіх КРІМ того, кого видаляємо
    usersDB = usersDB.filter(user => user.discord_id !== id);
    res.json({ message: 'User deleted successfully' });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`DB Server running at http://localhost:${port}`);
});