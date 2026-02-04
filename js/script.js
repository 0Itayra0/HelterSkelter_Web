// Реалізація відкриття/закриття меню
const iconMenu = document.querySelector('.menu__icon');
const menuBody = document.querySelector('.menu__body');

if (iconMenu) {
    iconMenu.addEventListener("click", function (e) {
        document.body.classList.toggle('_lock'); // Блокуємо скрол
        iconMenu.classList.toggle('_active');
        menuBody.classList.toggle('active');
    });
}

// Функція завантаження користувачів з API
async function loadUsers() {
    const response = await fetch('/api/users'); // GET запит
    const users = await response.json();
    
    const tableBody = document.querySelector('.crud-table tbody');
    tableBody.innerHTML = ''; // Очистити старі дані

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
}

// Завантажити дані, якщо ми на сторінці адміна
if (document.querySelector('.admin-panel')) {
    loadUsers();
}