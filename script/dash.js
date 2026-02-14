const API_BASE_URL = "https://buzzard-assured-unicorn.ngrok-free.app/api";

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

// 既然不抓狀態了，我們直接讓它初始化為亮綠燈
function initStaticStatus() {
    const dot = document.getElementById('dash-status-dot');
    const text = document.getElementById('dash-status-text');
    if (dot && text) {
        dot.className = `w-2 h-2 rounded-full bg-green-500 animate-pulse`;
        text.className = `text-[8px] font-black uppercase text-green-500`;
        text.innerText = 'ONLINE';
    }
}

async function fetchCoinsFromDB(discordID) {
    try {
        const response = await fetch(`${API_BASE_URL}/get_player_data.php?discordID=${discordID}`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        const data = await response.json();
        if (data.success) {
            const coinElement = document.getElementById('coin-balance');
            animateValue(coinElement, 0, data.coins, 1000);
        }
    } catch (error) {
        console.error("資料庫連線異常", error);
    }
}

async function claimReward() {
    const userData = JSON.parse(localStorage.getItem('discord_user'));
    if (!userData) return;

    const btn = document.getElementById('claim-btn');
    btn.disabled = true;
    btn.innerText = "正在領取...";

    const formData = new FormData();
    formData.append('discordID', userData.id);
    formData.append('username', userData.username);

    try {
        const response = await fetch(`${API_BASE_URL}/claim_reward.php`, {
            method: 'POST',
            body: formData,
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        const result = await response.json();

        if (result.success) {
            const coinElement = document.getElementById('coin-balance');
            const currentCoins = parseInt(coinElement.innerText) || 0;
            animateValue(coinElement, currentCoins, result.newBalance, 1000);
            
            alert("🎉 " + result.message);
            btn.innerText = "今日已領取";
            btn.classList.replace('bg-indigo-600', 'bg-gray-700');
            btn.classList.add('cursor-not-allowed');
        } else {
            alert("❌ " + result.message);
            btn.disabled = false;
            btn.innerText = "CLAIM 10 COINS";
        }
    } catch (error) {
        alert("連線失敗");
        btn.disabled = false;
        btn.innerText = "CLAIM 10 COINS";
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
    fetchCoinsFromDB(user.id);
});

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}