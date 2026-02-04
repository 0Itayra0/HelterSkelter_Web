const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

let usersDB = [
    { discord_id: '9988776655', username: 'Yoshimura', balance: 5000, game_rank: 'SSS' },
    { discord_id: '1122334455', username: 'Test1', balance: 1500, game_rank: 'S' },
    { discord_id: '5566778899', username: 'Test2', balance: 200, game_rank: 'C' }
];

app.get('/api/users', (req, res) => {
    res.json(usersDB);
});

// CREATE
app.post('/api/users', (req, res) => {
    const newUser = {
        discord_id: req.body.discord_id || Date.now().toString().slice(-10),
        username: req.body.username || 'New_User',
        balance: parseInt(req.body.balance) || 0,
        game_rank: 'Recruit'
    };
    usersDB.push(newUser);
    console.log('User created:', newUser.username);
    res.status(201).json(newUser);
});

// READ + UPDATE
app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const { balance } = req.body;
    
    const userIndex = usersDB.findIndex(u => u.discord_id === id);
    
    if (userIndex !== -1) {
        usersDB[userIndex].balance = parseInt(balance);
        if (usersDB[userIndex].balance > 1000) usersDB[userIndex].game_rank = 'S';
        
        console.log('User updated:', id);
        res.json(usersDB[userIndex]);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// DELETE
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = usersDB.length;
    usersDB = usersDB.filter(user => user.discord_id !== id);
    
    if (usersDB.length < initialLength) {
        console.log('User deleted:', id);
        res.json({ message: 'Deleted' });
    } else {
        res.status(404).json({ message: 'Not found' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});