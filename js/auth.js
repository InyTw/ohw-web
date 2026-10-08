/* ==========================================================================
   ohw Network - 全站會員驗證與狀態管理 (auth.js)
   ========================================================================== */

// 1. 從 LocalStorage 讀取目前登入使用者狀態
let currentUser = JSON.parse(localStorage.getItem('ohw_user')) || null;

// 2. 頁面載入完成後初始化渲染導覽列狀態
document.addEventListener('DOMContentLoaded', () => {
    renderUserAuth();
});

/**
 * 渲染導覽列（Header）的使用者區塊
 */
function renderUserAuth() {
    const container = document.getElementById('userAuthContainer');
    if (!container) return;

    if (currentUser) {
        // 取得玩家名稱（若無則預設為 Steve）
        const mcName = currentUser.mcName || 'Steve';
        // 使用官方/第三方 Minecraft 頭像 API 動態生成頭像
        const avatarUrl = `https://mc-heads.net/avatar/${mcName}/32`;

        container.innerHTML = `
            <div class="user-profile-wrapper">
                <div class="user-profile-btn">
                    <img src="${avatarUrl}" alt="${mcName}" class="user-avatar">
                    <span class="user-name">${mcName}</span>
                    <span style="font-size: 0.65rem; color: var(--text-muted);">▼</span>
                </div>

                <div class="user-dropdown">
                    <div class="user-dropdown-header">
                        <div style="font-size: 0.85rem; font-weight: 700; color: #ffffff;">${mcName}</div>
                        <div class="user-role">${currentUser.isAdmin ? '⚡ 伺服器管理員' : '🎮 玩家會員'}</div>
                    </div>

                    <a href="#">👤 個人頁面</a>
                    <a href="#">⚙️ 帳號設定</a>
                    <a href="#">📜 我的論壇文章</a>
                    ${currentUser.isAdmin ? '<a href="news.html" style="color: var(--primary);">📢 發布官方公告</a>' : ''}
                    
                    <button class="logout-btn" onclick="handleLogout()">🚪 登出帳號</button>
                </div>
            </div>
        `;
    } else {
        // 未登入狀態：顯示「登入 / 註冊」按鈕，指向 login.html
        container.innerHTML = `
            <a href="login.html" class="btn-login" style="text-decoration:none;">登入 / 註冊</a>
        `;
    }
}

/**
 * Microsoft 帳號登入處理
 */
function loginWithMicrosoft() {
    // 實務開發提示：這裡之後可替換為實際後端 OAuth 重導向位址 (例如 window.location.href = '/api/auth/microsoft')
    currentUser = {
        id: 'ms_' + Date.now(),
        mcName: 'Alex_Steve', // 模擬取得的正版 Minecraft 玩家 ID
        provider: 'microsoft',
        isAdmin: false
    };

    saveUserAndRedirect('Microsoft 登入成功！已驗證 Minecraft 正版帳號。');
}

/**
 * Discord 帳號登入處理
 */
function loginWithDiscord() {
    // 實務開發提示：這裡之後可替換為實際後端 OAuth 重導向位址 (例如 window.location.href = '/api/auth/discord')
    currentUser = {
        id: 'discord_' + Date.now(),
        discordTag: 'User#1234',
        mcName: 'Steve', // 模擬綁定的 Minecraft 玩家 ID
        provider: 'discord',
        isAdmin: false
    };

    saveUserAndRedirect('Discord 登入成功！');
}

/**
 * 儲存 User 資料並跳轉回首頁
 */
function saveUserAndRedirect(message) {
    localStorage.setItem('ohw_user', JSON.stringify(currentUser));
    alert(message);
    window.location.href = 'index.html';
}

/**
 * 登出帳號處理
 */
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('ohw_user');
    renderUserAuth();
    
    // 如果目前在登入頁或個人設定頁，可跳轉回首頁
    if (window.location.pathname.includes('login.html')) {
        window.location.href = 'index.html';
    }
}