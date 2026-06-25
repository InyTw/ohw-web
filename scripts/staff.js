// --- 核心全域變數 ---
const SUPABASE_URL = 'https://zllomerkzdmmphfcceew.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsbG9tZXJremRtbXBoZmNjZWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMzUxOTQsImV4cCI6MjA5NzcxMTE5NH0.x_0KZpvzJQBPLFccYCzz4I2aqNPBnB-t0ohjHhKSePk';

let supabaseClient;
let currentUserObj = null;
let currentUsername = 'Staff';
let base64AvatarString = '';
let currentX = 50;
let currentY = 50;
let isDragging = false;
let startX, startY;
let startPercentX, startPercentY;
let cropper; // 裁切實例

// --- 初始化 Supabase ---
try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: true, storageKey: 'sb-auth-token', storage: window.localStorage }
    });
} catch (e) {
    alert("⚠️ 系統初始化失敗！");
}

// --- DOM 載入與初始化 ---
document.addEventListener('DOMContentLoaded', async () => {
    if (!supabaseClient) return;
    
    setupDragEvents();
    
    const profileEntry = document.getElementById('user-profile-entry');
    const profileTabBtn = document.querySelector('[onclick*="profile-panel"]');
    if (profileEntry && profileTabBtn) {
        profileEntry.addEventListener('click', () => { profileTabBtn.click(); });
    }

    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            currentUserObj = session.user;
            await fetchAndSyncProfile();
            removeOverlay();
        } else {
            window.location.href = 'staff-login.html';
        }
    } catch (err) {
        window.location.href = 'staff-login.html';
    }

    const avatarInput = document.getElementById('input-file-avatar');
    if (avatarInput) {
        avatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = document.getElementById('image-to-crop');
                img.src = event.target.result;
                document.getElementById('avatar-modal').style.display = 'block';
                if (cropper) cropper.destroy();
                cropper = new Cropper(img, { aspectRatio: 1, viewMode: 1, dragMode: 'move' });
            };
            reader.readAsDataURL(file);
        });
    }
});

// --- 核心功能函數 ---

async function fetchAndSyncProfile() {
    if (!currentUserObj) return;
    const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('username, avatar_url, rank, avatar_pos_x, avatar_pos_y')
        .eq('id', currentUserObj.id)
        .single();

    let dbUsername = currentUserObj.email.split('@')[0];
    let dbAvatarUrl = '';
    let dbRank = currentUserObj.user_metadata?.rank || 'Staff';
    
    currentX = 50;
    currentY = 50;

    if (profile && !error) {
        if(profile.username) dbUsername = profile.username;
        if(profile.avatar_url) dbAvatarUrl = profile.avatar_url;
        if(profile.rank) dbRank = profile.rank;
        if(profile.avatar_pos_x) currentX = parseInt(profile.avatar_pos_x);
        if(profile.avatar_pos_y) currentY = parseInt(profile.avatar_pos_y);
    }

    currentUsername = dbUsername;
    base64AvatarString = dbAvatarUrl;

    document.getElementById('display-email').innerText = currentUserObj.email;
    document.getElementById('display-username').innerText = dbUsername;
    document.getElementById('display-rank').innerText = `Rank: ${dbRank}`;
    document.getElementById('input-new-username').value = dbUsername;

    applyLiveAvatarStyle();
    
    const statusBadge = document.getElementById('display-status');
    if (currentUserObj.email_confirmed_at && statusBadge) {
        statusBadge.className = "verify-badge verified";
        statusBadge.innerText = "已驗證成員";
    }
}

function applyLiveAvatarStyle() {
    const avatarEl = document.getElementById('display-avatar');
    const previewBox = document.getElementById('avatar-preview-box');

    if (base64AvatarString) {
        if (previewBox) {
            previewBox.style.backgroundImage = `url('${base64AvatarString}')`;
            previewBox.style.backgroundPosition = `${currentX}% ${currentY}%`;
            previewBox.style.backgroundSize = "cover";
            previewBox.innerText = "";
        }
        if (avatarEl) {
            avatarEl.style.backgroundImage = `url('${base64AvatarString}')`;
            avatarEl.style.backgroundPosition = `${currentX}% ${currentY}%`;
            avatarEl.style.backgroundSize = "cover";
            avatarEl.innerText = "";
        }
    }
}

function setupDragEvents() {
    const box = document.getElementById('avatar-preview-box');
    if (!box) return;

    const handleMove = (x, y) => {
        if (!isDragging) return;
        currentX = startPercentX - ((x - startX) / 2);
        currentY = startPercentY - ((y - startY) / 2);
        currentX = Math.max(0, Math.min(100, currentX));
        currentY = Math.max(0, Math.min(100, currentY));
        applyLiveAvatarStyle();
    };

    box.addEventListener('mousedown', (e) => {
        if (!base64AvatarString) return;
        isDragging = true; startX = e.clientX; startY = e.clientY;
        startPercentX = currentX; startPercentY = currentY;
    });
    window.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', () => { isDragging = false; });

    box.addEventListener('touchstart', (e) => {
        if (!base64AvatarString) return;
        isDragging = true; startX = e.touches[0].clientX; startY = e.touches[0].clientY;
        startPercentX = currentX; startPercentY = currentY;
    });
    window.addEventListener('touchmove', (e) => handleMove(e.touches[0].clientX, e.touches[0].clientY));
    window.addEventListener('touchend', () => { isDragging = false; });
}

window.saveCroppedImage = function() {
    if (!cropper) { alert("錯誤：Cropper 未初始化！"); return; }
    try {
        const canvas = cropper.getCroppedCanvas({ width: 200, height: 200 });
        if (!canvas) { alert("無法擷取圖片"); return; }
        base64AvatarString = canvas.toDataURL('image/jpeg', 0.8);
        
        applyLiveAvatarStyle();
        
        document.getElementById('avatar-modal').style.display = 'none';
        cropper.destroy();
        cropper = null;
    } catch (err) { alert("儲存時發生錯誤：" + err.message); }
};

window.closeModal = function() {
    document.getElementById('avatar-modal').style.display = 'none';
    if (cropper) { 
        cropper.destroy(); 
        cropper = null; 
    }
};

async function updateUserProfileDatabase(e) {
    if(e) e.preventDefault();
    if (!currentUserObj) return;
    const btn = document.getElementById('btn-update-profile');
    if(btn) { btn.innerText = "儲存中..."; btn.disabled = true; }
    
    const { error } = await supabaseClient.from('profiles').upsert({ 
        id: currentUserObj.id,
        username: document.getElementById('input-new-username').value.trim(),
        avatar_url: base64AvatarString,
        avatar_pos_x: String(Math.round(currentX)),
        avatar_pos_y: String(Math.round(currentY)),
        updated_at: new Date().toISOString()
    });
    
    if (error) alert(`❌ 儲存失敗：${error.message}`);
    else { alert("🎉 個人資料已更新！"); await fetchAndSyncProfile(); }
    
    if(btn) { btn.innerText = "儲存個人設定"; btn.disabled = false; }
}

async function loadApplications() {
    const container = document.getElementById('review-list');
    if(!container) return;
    container.innerHTML = "讀取中...";
    const { data, error } = await supabaseClient.from('applications').select('*').eq('status', 'pending').order('created_at', { ascending: false });
    if (error) { container.innerHTML = "讀取失敗：" + error.message; return; }
    if (data.length === 0) { container.innerHTML = "<div class='card'>目前沒有待審申請。</div>"; return; }
    container.innerHTML = data.map(app => `
        <div class="card" style="margin-bottom:1rem;">
            <h3>${app.mc_id} - ${app.role}</h3>
            <p>Discord: ${app.dc_id} | Email: ${app.email}</p>
            <p>${app.bio}</p>
            <button onclick="updateStatus(${app.id}, 'approved')">通過</button>
            <button onclick="updateStatus(${app.id}, 'rejected')">拒絕</button>
        </div>
    `).join('');
}

window.updateStatus = async function(id, status) {
    const { error } = await supabaseClient.from('applications').update({ status: status }).eq('id', id);
    if (error) alert("操作失敗：" + error.message);
    else { alert("狀態已更新！"); loadApplications(); }
};

window.switchTab = function(panelId, element) {
    document.querySelectorAll('.content-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.getElementById(panelId).classList.add('active');
    element.classList.add('active');
    if (panelId === 'review-panel') loadApplications();
};

function removeOverlay() { document.getElementById('loading-overlay').style.display = 'none'; }
async function handleLogout() { if (confirm('確定登出？')) { await supabaseClient.auth.signOut(); window.location.href = 'staff-login.html'; } }
async function publishNews(e) { e.preventDefault(); alert("新聞發布成功"); }



window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
    
    // 如果你有主面板，可以透過調整 margin-left 來自動撐開
    const mainContent = document.querySelector('main'); // 假設你的主面板在 <main> 裡
    if (mainContent) {
        mainContent.style.marginLeft = sidebar.classList.contains('collapsed') ? '60px' : '250px';
    }
};