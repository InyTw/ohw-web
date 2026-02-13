const API_BASE_URL = "https://e19a-2001-b011-9801-d9e6-410a-257c-8f0a-4640.ngrok-free.app/api";

document.addEventListener('DOMContentLoaded', () => {
    const userData = localStorage.getItem('discord_user');
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }
    const user = JSON.parse(userData);
    
    document.getElementById('dash-username').innerText = user.username;
    document.getElementById('welcome-user').innerText = user.username;
    if (user.avatar) {
        const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
        document.getElementById('dash-avatar').src = avatarUrl;
    }

    fetchCoinsFromDB(user.id);
});

async function fetchCoinsFromDB(discordID) {
    try {
        const response = await fetch(`${API_BASE_URL}/get_player_data.php?discordID=${discordID}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true' // 👈 加上這一行，直接跳過警告頁面
            }
        });
        const data = await response.json();

        if (data.success) {
            const coinElement = document.getElementById('coin-balance');
            animateValue(coinElement, 0, data.coins, 1000);
        } else {
            console.error("無法讀取餘額:", data.message);
            document.getElementById('coin-balance').innerText = "0";
        }
    } catch (error) {
        console.error("資料庫連線異常", error);
        document.getElementById('coin-balance').innerText = "Error";
    }
}

async function claimReward() {
    const userData = JSON.parse(localStorage.getItem('discord_user'));
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
            headers: {
                'ngrok-skip-browser-warning': 'true' // 👈 這裡也要加
            }
        });
        const result = await response.json();

        if (result.success) {
            const coinElement = document.getElementById('coin-balance');
            const currentCoins = parseInt(coinElement.innerText) || 0;
            animateValue(coinElement, currentCoins, result.newBalance, 1000);
            
            alert("🎉 " + result.message);
            btn.innerText = "今日已領取";
            btn.classList.remove('bg-indigo-600', 'hover:bg-indigo-500');
            btn.classList.add('bg-gray-700', 'cursor-not-allowed');
        } else {
            alert("❌ " + result.message);
            btn.disabled = false;
            btn.innerText = "領取10 ohw coins";
        }
    } catch (error) {
        alert("連線失敗，請確認你的 ngrok 視窗是否開啟中");
        btn.disabled = false;
        btn.innerText = "領取10 ohw coins";
    }
}

// 數字滾動效果維持不變...
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

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}