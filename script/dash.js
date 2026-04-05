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

// 分頁切換邏輯
        function switchTab(tabId) {
            document.querySelectorAll('.tab-content').forEach(s => s.classList.add('hidden'));
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            
            document.getElementById(tabId + '-section').classList.remove('hidden');
            const targetNav = document.getElementById('nav-' + tabId);
            if(targetNav) targetNav.classList.add('active');
            
            document.getElementById('user-dropdown').classList.add('hidden');
            window.scrollTo(0,0);
        }

        // 用戶菜單
        function toggleUserMenu(e) { 
            e.stopPropagation(); 
            document.getElementById('user-dropdown').classList.toggle('hidden'); 
        }

        window.onclick = () => {
            document.getElementById('user-dropdown').classList.add('hidden');
        };

        // 模擬 Store 處理
        function openCheckout(name, price) {
            alert("系統正在初始化 " + name + " 目前不法開放購買，請稍後再試！");
        }

        async function updateOHWStats() {
    try {
        // 1. 這裡必須用 raw.githubusercontent 連結，並加上時間戳防止快取
        const STATS_URL = "https://raw.githubusercontent.com/InyTw/SakiBot-Music/main/stats.json?t=" + new Date().getTime();
        
        const response = await fetch(STATS_URL);
        if (!response.ok) throw new Error("Network response was not ok");
        
        const data = await response.json();
        const mc = data.minecraft;

        // 2. 更新人數數字 (對應你的 0 / 1000)
        // 假設你的 HTML ID 分別是 mc-online 和 mc-max
        if(document.getElementById('mc-online')) {
            document.getElementById('mc-online').innerText = mc.online ? mc.current : "0";
        }
        if(document.getElementById('mc-max')) {
            document.getElementById('mc-max').innerText = mc.max || "1000";
        }

        // 3. 更新進度條 (你的那條橫線)
        const bar = document.getElementById('mc-bar');
        if(bar) {
            const percent = (mc.current / (mc.max || 1000)) * 100;
            bar.style.width = `${percent}%`;
        }

        // 抓取 Minecraft 延遲數據
        const mcPing = data.minecraft.ping; 
        const pingElement = document.getElementById('ping');

        if (pingElement) {
            // 1. 更新數值
            pingElement.innerText = data.minecraft.online ? `${mcPing}ms` : "---";

            // 2. 自動切換顏色 (越順越綠，越卡越紅)
            if (!data.minecraft.online) {
                pingElement.className = "text-gray-500 font-bold"; // 離線變灰
            } else if (mcPing < 50) {
                pingElement.className = "text-green-500 font-bold"; // 極速
            } else if (mcPing < 150) {
                pingElement.className = "text-yellow-500 font-bold"; // 普通
            } else {
                pingElement.className = "text-red-500 font-bold"; // 延遲高
            }
        }

        console.log("✅ OHW 數據更新成功");

    } catch (err) {
        console.warn("⚠️ OHW 數據抓取失敗：", err);
    }
}
// 每 30 秒自動刷新一次「型」度
setInterval(updateOHWStats, 30000);
updateOHWStats();