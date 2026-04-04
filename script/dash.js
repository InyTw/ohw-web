function initStaticStatus() {
    const dot = document.getElementById('dash-status-dot');
    const text = document.getElementById('dash-status-text');
    if (dot && text) {
        dot.className = `w-2 h-2 rounded-full bg-green-500 animate-pulse`;
        text.className = `text-[8px] font-black uppercase text-green-500`;
        text.innerText = 'ONLINE';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const userData = localStorage.getItem('discord_user');
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }
    const user = JSON.parse(userData);
    
    if (document.getElementById('dash-username')) document.getElementById('dash-username').innerText = user.username;
    if (document.getElementById('welcome-user')) document.getElementById('welcome-user').innerText = user.username;
    
    const avatarImg = document.getElementById('dash-avatar');
    if (avatarImg && user.avatar) {
        avatarImg.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
    }

    initStaticStatus();
});

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}