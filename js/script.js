const API_URL = 'http://localhost:3000/api/users';
const LOGIN_URL = 'http://localhost:3000/api/login';
const PROFILE_URL = 'http://localhost:3000/api/profile'; // Маршрут профілю

// --- AUTHENTICATION (Вхід) ---
async function handleLogin(event) {
    event.preventDefault(); 
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');

    try {
        const response = await fetch(LOGIN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            // Зберігає токен
            localStorage.setItem('token', data.token);
            
            // Перенаправлення залежно від ролі
            if (data.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'profile.html';
            }
        } else {
            errorMsg.style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
    }
}

// Функція для отримання заголовків з токеном
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// --- PROFILE LOGIC (НОВЕ: Завантаження даних профілю) ---
async function loadProfile() {
    try {
        const response = await fetch(PROFILE_URL, {
            headers: getAuthHeaders() // Відправляємо токен, щоб сервер впізнав юзера
        });

        if (response.ok) {
            const user = await response.json();
            
            // Заповнюємо HTML реальними даними
            // Перевіряємо чи існують елементи, щоб уникнути помилок
            if(document.getElementById('header-balance')) 
                document.getElementById('header-balance').innerText = user.balance;
            
            if(document.getElementById('profile-name'))
                document.getElementById('profile-name').innerText = user.username;
            
            if(document.getElementById('profile-rank'))
                document.getElementById('profile-rank').innerText = user.game_rank;
            
            if(document.getElementById('profile-role'))
                document.getElementById('profile-role').innerText = user.role;
            
            if(document.getElementById('profile-balance'))
                document.getElementById('profile-balance').innerText = user.balance;

        } else {
            // Якщо токен недійсний - на логін
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// --- ADMIN PANEL LOGIC ---

async function loadUsers() {
    try {
        const response = await fetch(API_URL); // GET запит публічний
        const users = await response.json();
        
        const tableBody = document.querySelector('.crud-table tbody');
        if (!tableBody) return; 

        tableBody.innerHTML = ''; 

        users.forEach(user => {
            const row = `
                <tr>
                    <td>${user.discord_id}</td>
                    <td>${user.username}</td>
                    <td>${user.balance}</td>
                    <td><span class="badge badge-sss">${user.game_rank}</span></td>
                    <td>
                        <button onclick="editUser('${user.discord_id}')" class="action-btn btn-edit">Edit</button>
                        <button onclick="deleteUser('${user.discord_id}')" class="action-btn btn-delete">Delete</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

// Глобальні функції (Create/Edit/Delete) тепер надсилають ТОКЕН
window.createUser = async function() {
    const username = prompt("Enter Username:");
    if (!username) return;
    const balance = prompt("Balance:", "0");

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ username, balance })
    });

    if (response.status === 403) alert("Access Denied: Admins Only!");
    else loadUsers();
}

window.editUser = async function(id) {
    const newBalance = prompt("New balance:");
    if (!newBalance) return;

    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ balance: newBalance })
    });

    if (response.status === 403) alert("Access Denied: Admins Only!");
    else loadUsers(); 
}

window.deleteUser = async function(id) {
    if (!confirm("Are you sure?")) return;

    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    if (response.status === 403) alert("Access Denied: Admins Only!");
    else loadUsers(); 
}

// Logout
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// --- ГОЛОВНИЙ ЗАПУСК ---
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Логіка для АДМІН
    if (document.querySelector('.admin-panel')) {
        if (!localStorage.getItem('token')) {
            window.location.href = 'login.html';
        }
        loadUsers();
    }
    
    // 2. Логіка для ПРОФІЛЮ
    if (document.getElementById('profile-name')) {
        if (!localStorage.getItem('token')) {
            window.location.href = 'login.html';
        }
        loadProfile();
    }

    // 3. Універсальна кнопка Logout
    const logoutBtn = document.getElementById('logoutBtn') || document.querySelector('a[href="index.html"]');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});