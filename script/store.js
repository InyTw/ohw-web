// 全域變數儲存選中的支付方式
let selectedMethod = 'Coins'; 

// 1. 分頁切換邏輯 (SPA)
function switchTab(tab) {
    ['overview', 'store', 'rules'].forEach(id => {
        const section = document.getElementById(id + '-section');
        const navBtn = document.getElementById('nav-' + id);
        
        if (section) section.classList.add('hidden');
        if (navBtn) {
            navBtn.classList.remove('nav-link-active');
            navBtn.classList.add('text-gray-500');
        }
    });

    const activeSection = document.getElementById(tab + '-section');
    const activeNav = document.getElementById('nav-' + tab);
    
    if (activeSection) activeSection.classList.remove('hidden');
    if (activeNav) {
        activeNav.classList.add('nav-link-active');
        activeNav.classList.remove('text-gray-500');
    }
}

// 2. 使用者選單切換
function toggleUserMenu(event) {
    event.stopPropagation();
    document.getElementById('user-dropdown').classList.toggle('hidden');
}

// 3. 結帳功能 (新增 isCoinPackage 判斷防止刷錢 Bug)
function openCheckout(name, priceStr, coinCost, isCoinPackage = false) {
    // 設定顯示資訊
    document.getElementById('modal-item-name').innerText = name;
    document.getElementById('modal-price').innerText = priceStr;
    
    const coinBtn = document.getElementById('pay-with-coins');
    const cashLabel = document.getElementById('cash-pay-divider'); // 記得在 HTML 加入這個 ID
    const coinStatus = document.getElementById('coin-status');

    // --- BUG 防護邏輯 ---
    if (isCoinPackage) {
        // 如果是 Coins 禮包，直接隱藏 Coins 支付選項
        coinBtn.classList.add('hidden');
        if (cashLabel) cashLabel.classList.add('hidden');
        selectedMethod = 'Card'; // 強制預選現金
    } else {
        // 如果是 Rank 兌換，顯示 Coins 選項並檢查餘額
        coinBtn.classList.remove('hidden');
        if (cashLabel) cashLabel.classList.remove('hidden');

        const balanceText = document.getElementById('coin-balance').innerText;
        const currentBalance = parseInt(balanceText.replace(/,/g, '')) || 0;

        if (currentBalance < coinCost) {
            coinBtn.style.opacity = "0.4";
            coinBtn.style.cursor = "not-allowed";
            coinStatus.innerText = "餘額不足";
            coinStatus.className = "text-[10px] font-black text-red-500";
            selectedMethod = 'Card'; 
        } else {
            coinBtn.style.opacity = "1";
            coinBtn.style.cursor = "pointer";
            coinStatus.innerText = "可用";
            coinStatus.className = "text-[10px] font-black text-green-400";
            setPayment('Coins', coinBtn); 
        }
    }

    document.getElementById('checkout-modal').classList.remove('hidden');
}

// 4. 設定支付方式 (視覺選中效果)
function setPayment(method, el) {
    if (method === 'Coins' && el.style.opacity === "0.4") return;

    selectedMethod = method;
    document.querySelectorAll('.payment-option').forEach(opt => {
        opt.classList.remove('border-indigo-500', 'bg-white/10', 'bg-indigo-500/20');
        opt.classList.add('border-white/10');
    });

    el.classList.remove('border-white/10');
    el.classList.add('border-indigo-500', method === 'Coins' ? 'bg-indigo-500/20' : 'bg-white/10');
}

// 5. 最終提交購買
function finalSubmit() {
    const playerID = localStorage.getItem('ohw_player_id') || '玩家';
    const item = document.getElementById('modal-item-name').innerText;
    
    if (selectedMethod === 'Coins') {
        const confirmPay = confirm(`確定要花費 OHW-Coins 購買 ${item} 嗎？`);
        if (confirmPay) {
            alert(`【購買成功】已成功兌換項目 [${item}]！`);
            closeModal();
        }
    } else {
        alert(`正在跳轉金流管道...\n玩家ID: ${playerID}\n方式: ${selectedMethod}`);
    }
}

// 6. 基礎功能
function closeModal() { document.getElementById('checkout-modal').classList.add('hidden'); }

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

window.onclick = function(event) {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown && !event.target.closest('#user-menu-btn')) dropdown.classList.add('hidden');
}