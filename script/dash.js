const API_BASE_URL = "https://buzzard-assured-unicorn.ngrok-free.app/api";

// 數字滾動效果
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// 狀態更新函式
function updateUserStatus(status) {
    const dot = document.getElementById('dash-status-dot');
    const text = document.getElementById('dash-status-text');
    if (!dot || !text) return;

    const statusMap = {
        'online': { color: 'bg-green-500', textColor: 'text-green-500', label: 'ONLINE' },
        'idle': { color: 'bg-yellow-500', textColor: 'text-yellow-500', label: 'IDLE' },
        'dnd': { color: 'bg-red-500', textColor: 'text-red-500', label: 'DND' },
        'offline': { color: 'bg-gray-500', textColor: 'text-gray-500', label: 'OFFLINE' }
    };

    const current = statusMap[status] || statusMap['online'];
    dot.className = `w-2 h-2 rounded-full ${current.color} animate-pulse`;
    text.className = `text-[8px] font-black uppercase ${current.textColor}`;
    text.innerText = current.label;
}

// 同步 Discord 實時狀態 (Lanyard API)
async function syncDiscordPresence(discordID) {
    try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${discordID}`);
        const data = await response.json();
        if (data.success) {
            updateUserStatus(data.data.discord_status);
        }
    } catch (e) {
        console.error("無法同步 Discord 狀態", e);
    }
}

// 獲取餘額
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
        document.getElementById('coin-balance').innerText = "Error";
    }
}

// 領取獎勵
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

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    const userData = localStorage.getItem('discord_user');
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }
    const user = JSON.parse(userData);
    
    // 渲染基礎資訊
    document.getElementById('dash-username').innerText = user.username;
    if(document.getElementById('welcome-user')) {
        document.getElementById('welcome-user').innerText = user.username;
    }
    
    if (user.avatar && document.getElementById('dash-avatar')) {
        const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
        document.getElementById('dash-avatar').src = avatarUrl;
    }

    // 呼叫外部 API
    fetchCoinsFromDB(user.id);
    syncDiscordPresence(user.id);
});

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}