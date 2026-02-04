// Головна URL API
const API_URL = 'http://localhost:3000/api/users';

// 1. READ: Завантаження даних
async function loadUsers() {
    try {
        const response = await fetch(API_URL);
        const users = await response.json();
        
        const tableBody = document.querySelector('.crud-table tbody');
        if (!tableBody) return; // Якщо ми не на сторінці адміна

        tableBody.innerHTML = ''; // Очистити таблицю

        users.forEach(user => {
            const row = `
                <tr>
                    <td>${user.discord_id}</td>
                    <td>${user.username}</td>
                    <td>${user.balance}</td>
                    <td><span class="badge badge-sss">${user.game_rank}</span></td>
                    <td>
                        <button onclick="editUser('${user.discord_id}')" class="action-btn btn-edit">Edit Balance</button>
                        <button onclick="deleteUser('${user.discord_id}')" class="action-btn btn-delete">Delete</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// 2. CREATE: Робимо функцію глобальною
window.createUser = async function() {
    const username = prompt("Enter Username:");
    if (!username) return;
    
    const balance = prompt("Enter Initial Balance:", "0");
    if (balance === null) return;

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            username: username, 
            balance: balance 
        })
    });
    
    loadUsers(); 
}

// 3. UPDATE: Робимо функцію глобальною
window.editUser = async function(id) {
    const newBalance = prompt("Enter new balance:");
    if (newBalance === null) return;

    await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: newBalance })
    });

    loadUsers(); 
}

// 4. DELETE: Робимо функцію глобальною
window.deleteUser = async function(id) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });

    loadUsers(); 
}

// Запуск при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    // Перевіряємо, чи ми на адмін-панелі
    if (document.querySelector('.admin-panel')) {
        loadUsers();
    }
});