const SUPABASE_URL = "https://zllomerkzdmmphfcceew.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsbG9tZXJremRtbXBoZmNjZWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMzUxOTQsImV4cCI6MjA5NzcxMTE5NH0.x_0KZpvzJQBPLFccYCzz4I2aqNPBnB-t0ohjHhKSePk";

let supabaseClient;
let currentUserObj = null;
let currentUsername = "Staff";
let base64AvatarString = "";
let currentX = 50;
let currentY = 50;
let isDragging = false;
let startX, startY;
let startPercentX, startPercentY;
let cropper;
let bgCropper;

try {
  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        storageKey: "sb-auth-token",
        storage: window.localStorage,
      },
    },
  );
} catch (e) {
  alert("Supabase 沒來上班...");
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!supabaseClient) return;

  setTimeout(loadStaffMembers, 1000);

  setupDragEvents();

  const profileEntry = document.getElementById("user-profile-entry");
  const profileTabBtn = document.querySelector('[onclick*="profile-panel"]');
  if (profileEntry && profileTabBtn) {
    profileEntry.addEventListener("click", () => {
      profileTabBtn.click();
    });
  }

  try {
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();
    if (session) {
      currentUserObj = session.user;
      localStorage.setItem("user_id", currentUserObj.id);
      await fetchAndSyncProfile();
      await renderStaffCard();
      removeOverlay();
    } else {
      window.location.href = "staff-login.html";
    }
  } catch (err) {
    console.error("Error :< :", err);
    window.location.href = "staff-login.html";
  }

  const avatarInput = document.getElementById("input-file-avatar");
  if (avatarInput) {
    avatarInput.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = document.getElementById("image-to-crop");
        img.src = event.target.result;
        document.getElementById("avatar-modal").style.display = "flex";
        if (cropper) cropper.destroy();
        cropper = new Cropper(img, {
          aspectRatio: 1,
          viewMode: 1,
          dragMode: "move",
        });
      };
      reader.readAsDataURL(file);
    });
  }
});

async function fetchAndSyncProfile() {
  if (!currentUserObj) return;
  const { data: profile, error } = await supabaseClient
    .from("profiles")
    .select("username, avatar_url, rank, avatar_pos_x, avatar_pos_y, bio")
    .eq("id", currentUserObj.id)
    .single();

  let dbUsername = currentUserObj.email.split("@")[0];
  let dbAvatarUrl = "";
  let dbRank = currentUserObj.user_metadata?.rank || "Staff";

  currentX = 50;
  currentY = 50;

  if (profile && !error) {
    if (profile.username) dbUsername = profile.username;
    if (profile.avatar_url) dbAvatarUrl = profile.avatar_url;
    if (profile.rank) dbRank = profile.rank;
    if (profile.avatar_pos_x) currentX = parseInt(profile.avatar_pos_x);
    if (profile.avatar_pos_y) currentY = parseInt(profile.avatar_pos_y);
  }

  currentUsername = dbUsername;
  base64AvatarString = dbAvatarUrl;

  document.getElementById("display-email").innerText = currentUserObj.email;
  document.getElementById("display-username").innerText = dbUsername;
  document.getElementById("display-rank").innerText = `Rank: ${dbRank}`;
  document.getElementById("input-new-username").value = dbUsername;
  if(document.getElementById("bio-input")) document.getElementById("bio-input").value = profile?.bio || "";

  applyLiveAvatarStyle();

  const statusBadge = document.getElementById("display-status");
  if (currentUserObj.email_confirmed_at && statusBadge) {
    statusBadge.className = "verify-badge verified";
    statusBadge.innerText = "已驗證成員";
  }
}

function applyLiveAvatarStyle() {
  const avatarEl = document.getElementById("display-avatar");
  const previewBox = document.getElementById("avatar-preview-box");

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
  const box = document.getElementById("avatar-preview-box");
  if (!box) return;

  const handleMove = (x, y) => {
    if (!isDragging) return;
    currentX = startPercentX - (x - startX) / 2;
    currentY = startPercentY - (y - startY) / 2;
    currentX = Math.max(0, Math.min(100, currentX));
    currentY = Math.max(0, Math.min(100, currentY));
    applyLiveAvatarStyle();
  };

  box.addEventListener("mousedown", (e) => {
    if (!base64AvatarString) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startPercentX = currentX;
    startPercentY = currentY;
  });
  window.addEventListener("mousemove", (e) => handleMove(e.clientX, e.clientY));
  window.addEventListener("mouseup", () => {
    isDragging = false;
  });

  box.addEventListener("touchstart", (e) => {
    if (!base64AvatarString) return;
    isDragging = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    startPercentX = currentX;
    startPercentY = currentY;
  });
  window.addEventListener("touchmove", (e) =>
    handleMove(e.touches[0].clientX, e.touches[0].clientY),
  );
  window.addEventListener("touchend", () => {
    isDragging = false;
  });
}

document.getElementById('bg-upload')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
        document.getElementById('bg-to-crop').src = event.target.result;
        document.getElementById('bg-modal').style.display = 'flex';

        bgCropper = new Cropper(document.getElementById('bg-to-crop'), {
            aspectRatio: 9 / 16, 
            viewMode: 1
        });
    };
    reader.readAsDataURL(file);
});

function closeBgModal() {
    document.getElementById('bg-modal').style.display = 'none';
    if(bgCropper) bgCropper.destroy();
}

window.saveCroppedBg = async function() {
    if (!bgCropper) {
        alert("Cropper 沒載入");
        return;
    }
    bgCropper.getCroppedCanvas().toBlob(async (blob) => {
        const fileName = `bg_${localStorage.getItem('user_id')}_${Date.now()}.png`;
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
            .from('backgrounds')
            .upload(fileName, blob);

        if (uploadError) {
            alert("上傳失敗：" + uploadError.message);
            return;
        }

        const { data } = supabaseClient.storage
            .from('backgrounds')
            .getPublicUrl(fileName);

        const { error: updateError } = await supabaseClient
            .from("profiles")
            .update({ card_bg_url: data.publicUrl })
            .eq("id", localStorage.getItem("user_id"));

        if (!updateError) {
            closeBgModal();
            alert("背景已更新！");
            renderStaffCard();
        }
    });
}

window.saveCroppedImage = function () {
  if (!cropper) {
    alert("Errrrrr：Cropper 沒上班...");
    return;
  }
  try {
    const canvas = cropper.getCroppedCanvas({ width: 200, height: 200 });
    if (!canvas) {
      alert("你的圖片被網路吃掉了，再試試看，說不定他會吐出來:)");
      return;
    }
    base64AvatarString = canvas.toDataURL("image/jpeg", 0.8);

    applyLiveAvatarStyle();

    document.getElementById("avatar-modal").style.display = "none";
    cropper.destroy();
    cropper = null;
  } catch (err) {
    alert("儲存的時候遇到蟲了(bug)：" + err.message);
  }
};

window.closeModal = function () {
  document.getElementById("avatar-modal").style.display = "none";
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
};

window.updateUserProfileDatabase = async function(event) {
  if (event) event.preventDefault();
  if (!currentUserObj) return;
  const saveBtn = document.getElementById("btn-update-profile");
  const originalText = saveBtn.innerHTML;
  
  if (saveBtn) {
    saveBtn.innerText = "儲存中...";
    saveBtn.disabled = true;
  }

  const { error } = await supabaseClient.from("profiles").upsert({
    id: currentUserObj.id,
    username: document.getElementById("input-new-username").value.trim(),
    bio: document.getElementById("bio-input")?.value.trim(),
    avatar_url: base64AvatarString,
    avatar_pos_x: String(Math.round(currentX)),
    avatar_pos_y: String(Math.round(currentY)),
    updated_at: new Date().toISOString(),
  });

  if (error) alert(`❌ 沒法儲存：${error.message}`);
  else {
    saveBtn.innerHTML = "已儲存 ✓";
    saveBtn.classList.add("success");
    await fetchAndSyncProfile();
    renderStaffCard();
    
    setTimeout(() => {
        saveBtn.innerHTML = originalText;
        saveBtn.classList.remove("success");
        saveBtn.disabled = false;
    }, 2000);
  }

  if (saveBtn && !error) {
    saveBtn.disabled = false;
  }
}

async function loadApplications() {
  const container = document.getElementById("review-list");
  if (!container) return;
  container.innerHTML = "reading...";
  const { data, error } = await supabaseClient
    .from("applications")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) {
    container.innerHTML = "No~~~~~~：" + error.message;
    return;
  }
  if (data.length === 0) {
    container.innerHTML = "<div class='card'>目前沒有待審申請</div>";
    return;
  }
  container.innerHTML = data
    .map(
      (app) => `
        <div class="card" style="margin-bottom:1rem;">
            <h3>${app.mc_id} - ${app.role}</h3>
            <p>Discord: ${app.dc_id} | Email: ${app.email}</p>
            <p>${app.bio}</p>
            <button onclick="updateStatus(${app.id}, 'approved')">通過</button>
            <button onclick="updateStatus(${app.id}, 'rejected')">拒絕</button>
        </div>
    `,
    )
    .join("");
}

window.updateStatus = async function (id, status) {
  const { error } = await supabaseClient
    .from("applications")
    .update({ status: status })
    .eq("id", id);
  if (error) alert("Fail :/ ：" + error.message);
  else {
    alert("狀態已更新！");
    loadApplications();
  }
};

window.switchTab = function (panelId, element) {
    document.querySelectorAll(".content-panel").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));

    document.getElementById(panelId).classList.add("active");
    if(element) element.classList.add("active");

    if (panelId === "staff-members-panel") { 
        loadStaffMembers(); 
    }
};

function removeOverlay() {
  document.getElementById("loading-overlay").style.display = "none";
}

async function handleLogout() {
  if (confirm("你真的要登出？😢")) {
    await supabaseClient.auth.signOut();
    window.location.href = "staff-login.html";
  }
}

async function publishNews(e) {
  e.preventDefault();
  alert("新聞已成功發布");
}

window.toggleSidebar = function () {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("collapsed");

  const mainContent = document.querySelector("main");
  if (mainContent) {
    mainContent.style.marginLeft = sidebar.classList.contains("collapsed")
      ? "60px"
      : "250px";
  }
};

async function renderStaffCard() {
  const userId = localStorage.getItem("user_id");

  const { data: profile } = await supabaseClient
    .from("profiles")
    .select("username, bio, rank, avatar_url, work, card_bg_url")
    .eq("id", userId)
    .single();

  if (profile) {
    document.getElementById("card-username").innerText =
      profile.username || "ohw_staff";
    document.getElementById("card-rank").innerText = profile.rank || "Staff";
    document.getElementById("card-bio").innerText =
      profile.bio || "這傢伙沒有自介...";
    document.getElementById("card-role-desc").innerText =
      profile.work || "維護伺服器日常運行與...日常運行";

    const avatar = document.getElementById("card-avatar");
    if (avatar && profile.avatar_url) {
      avatar.style.backgroundImage = `url('${profile.avatar_url}')`;
    }

    const card = document.getElementById("staff-card-container");
    if (card) {
      if (profile.card_bg_url) {
        card.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('${profile.card_bg_url}')`;
      } else {
        card.style.backgroundImage = "none";
      }
      card.style.backgroundSize = 'cover';
      card.style.backgroundPosition = "center";
      card.style.backgroundRepeat = "no-repeat";
      card.style.borderRadius = '24px';
      card.style.padding= '30px';
    }
  }
}

async function uploadAndSaveBackground(event) {
  event.preventDefault();
  const saveBtn = document.getElementById("save-btn");
  const fileInput = document.getElementById("bg-upload");
  const file = fileInput.files[0];

  if (!file) {
    alert("請先選擇一張圖片！");
    return;
  }

  saveBtn.innerText = "上傳中...";
  saveBtn.disabled = true;

  const fileName = `bg_${localStorage.getItem("user_id")}_${Date.now()}.png`;
  const { error: uploadError } = await supabaseClient.storage
    .from("backgrounds")
    .upload(fileName, file);

  if (uploadError) {
    alert("上傳失敗: " + uploadError.message);
    saveBtn.innerText = "儲存設定";
    saveBtn.disabled = false;
    return;
  }

  const { data: publicUrlData } = supabaseClient.storage
    .from("backgrounds")
    .getPublicUrl(fileName);

  const { error: updateError } = await supabaseClient
    .from("profiles")
    .update({ card_bg_url: publicUrlData.publicUrl })
    .eq("id", localStorage.getItem("user_id"));

  if (!updateError) {
    saveBtn.innerText = "已儲存 ✓";
    saveBtn.classList.add("success");
    setTimeout(() => {
      saveBtn.innerText = "儲存設定";
      saveBtn.classList.remove("success");
      saveBtn.disabled = false;
    }, 3000);
    renderStaffCard();
  }
}

async function loadStaffMembers() {
    const container = document.getElementById("staff-members-list");
    container.innerHTML = "讀取中...";

    // 1. 我們現在選單選的是 "角色模式"，對應到你的 rolePermissions 設定
    const availableRoles = ["Staff", "Builder", "Admin", "Owner"];

    const { data: members, error } = await supabaseClient
        .from("profiles")
        .select("id, username, avatar_url, rank, email");

    if (error) { container.innerHTML = "無法獲取成員：" + error.message; return; }

    container.innerHTML = members.map(m => `
        <div class="member-row">
            <div class="m-avatar" style="background-image: url('${m.avatar_url || 'default.png'}')"></div>
            <div class="m-name">${m.username || '無名稱'}</div>
            <div class="m-rank">${m.rank || 'Staff'}</div>
            <div class="m-email">${m.email || '無電子郵件'}</div>
            
            <!-- 選單現在代表「權限模式」 -->
            <select class="m-perm" onchange="updateMemberPermissions('${m.id}', this.value, '${m.rank}')">
                ${availableRoles.map(role => `
                    <option value="${role}" ${m.rank === role ? 'selected' : ''}>${role} 權限模式</option>
                `).join("")}
            </select>
        </div>
    `).join("");
}

window.updateMemberPermissions = async function(targetUserId, selectedRole, targetCurrentRank) {
    // 1. 階級檢查 (保護機制)
    if (rankHierarchy[myProfile.rank] <= rankHierarchy[targetCurrentRank] && myProfile.rank !== 'Owner') {
        alert("你沒有權限修改等級比你高或同級的人！");
        return;
    }

    // 2. 根據選定的角色，取出對應的權限陣列 (來自你定義的 rolePermissions)
    const newPermissions = rolePermissions[selectedRole];

    // 3. 更新資料庫
    const { error } = await supabaseClient
        .from("profiles")
        .update({ 
            rank: selectedRole, // 同步更新職位名稱
            permissions: newPermissions // 更新權限陣列
        })
        .eq("id", targetUserId);

    if (error) {
        alert("權限更新失敗：" + error.message);
    } else {
        alert("權限已成功更新為 " + selectedRole + " 模式！");
        loadStaffMembers(); 
    }
};


// 必須先定義這兩個，你的 updateMemberRank 才能運作
const rankHierarchy = { 'Owner': 3, 'Admin': 2, 'Builder': 1, 'Staff': 0 };
let myProfile = { rank: 'Staff' }; // 請確保在執行前已經透過 supabase 撈出你的職位並賦值給此變數
let myPermissions = []; // 執行前請確保已根據你的 rank 從 rolePermissions 取出對應陣列

// 你的函式與配置
function hasPermission(userPermissions, requiredPermission) {
    if (!userPermissions) return false;
    if (userPermissions.includes('ALL')) return true; 
    return userPermissions.includes(requiredPermission);
}

const rolePermissions = {
    'Owner': [
        'panel.review', 'panel.news', 'panel.srv_manager', 'panel.srv_panel',
        'use.srv_manager.tp', 'use.srv_manager.setting', 'use.srv_manager.create',
        'use.srv_manager.delete', 'use.srv_manager.stop', 'use.srv_manager.start',
        'use.srv_manager.restart', 'use.news.create', 'use.news.delete',
        'use.news.edit', 'use.review.approval', 'use.review.unapproved', 'use.permissions'
    ],
    'Admin': [
        'panel.review', 'panel.news', 'panel.srv_manager', 'panel.srv_panel',
        'use.srv_manager.tp', 'use.news.create', 'use.news.edit',
        'use.review.approval', 'use.review.unapproved', 'use.permissions'
    ],
    'Builder': [
        'panel.review', 'panel.news', 'use.review.approval', 'use.review.unapproved',
        'use.news.create', 'use.news.delete'
    ],
    'Staff': [
        'panel.review', 'panel.news', 'use.review.approval',
        'use.review.unapproved', 'use.news.create', 'use.news.delete'
    ]
};

// 權限檢查 UI 控制
if (!hasPermission(myPermissions, 'use.news.create')) {
    const btn = document.getElementById('create-news-btn');
    if (btn) btn.style.display = 'none';
}

// 權限更新
window.updateMemberRank = async function(targetUserId, newRank, targetCurrentRank) {
    const myRank = myProfile.rank;

    if (rankHierarchy[myRank] <= rankHierarchy[targetCurrentRank] && myRank !== 'Owner') {
        alert("你沒有權限修改與你同級或更高等級的成員！");
        return;
    }

    const { error } = await supabaseClient
        .from("profiles")
        .update({ rank: newRank })
        .eq("id", targetUserId);

    if (error) {
        alert("更新失敗：" + error.message);
    } else {
        alert("權限已更新！");
        loadStaffMembers();
    }
};