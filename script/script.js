let selectedPayment = '';

        document.addEventListener('DOMContentLoaded', () => {
            const playerID = localStorage.getItem('ohw_player_id');
            
            // 1. 顯示玩家身分
            if (playerID) {
                const nav = document.querySelector('nav div.space-x-8');
                const playerSpan = document.createElement('span');
                playerSpan.className = "text-indigo-400 font-black border-l border-white/10 pl-8 ml-2 flex items-center gap-2";
                playerSpan.innerHTML = `<img src="https://mc-heads.net/avatar/${playerID}/20" class="rounded-sm">${playerID}`;
                nav.appendChild(playerSpan);
            }

            // 2. 綁定所有購買按鈕
            document.querySelectorAll('.buy-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = localStorage.getItem('ohw_player_id');
                    if (!id) {
                        alert("⚠️ 請先返回首頁登入您的 Minecraft ID！");
                        window.location.href = "index.html";
                        return;
                    }
                    const card = this.closest('.store-card');
                    const item = card.querySelector('h3').innerText;
                    const price = card.querySelector('.price-tag').innerText.split('\n')[0];
                    openModal(id, item, price);
                });
            });
        });

        function openModal(id, item, price) {
            document.getElementById('modal-player-id').innerText = id;
            document.getElementById('modal-avatar').src = `https://mc-heads.net/avatar/${id}/40`;
            document.getElementById('modal-item-name').innerText = item;
            document.getElementById('modal-price').innerText = price;
            document.getElementById('checkout-modal').classList.remove('hidden');
        }

        function closeModal() {
            document.getElementById('checkout-modal').classList.add('hidden');
            // 清除選取狀態
            selectedPayment = '';
            document.querySelectorAll('.payment-option').forEach(opt => {
                opt.classList.remove('border-indigo-500', 'bg-indigo-500/10');
                opt.querySelector('.radio-dot').innerHTML = '';
            });
        }

        function setPayment(type, el) {
            selectedPayment = type;
            document.querySelectorAll('.payment-option').forEach(opt => {
                opt.classList.remove('border-indigo-500', 'bg-indigo-500/10');
                opt.querySelector('.radio-dot').innerHTML = '';
                opt.querySelector('.radio-dot').classList.remove('border-indigo-500');
            });
            el.classList.add('border-indigo-500', 'bg-indigo-500/10');
            const dot = el.querySelector('.radio-dot');
            dot.classList.add('border-indigo-500');
            dot.innerHTML = '<div class="w-2 h-2 bg-indigo-500 rounded-full"></div>';
        }

        function finalSubmit() {
            if (!selectedPayment) {
                alert("請選擇支付方式！");
                return;
            }
            const id = document.getElementById('modal-player-id').innerText;
            const item = document.getElementById('modal-item-name').innerText;
            
            alert(`正在導向支付頁面...\n玩家：${id}\n方式：${selectedPayment}`);
            
            if(selectedPayment === 'PayPal') {
                window.open("https://www.paypal.me/YOUR_ID", "_blank");
            } else {
                // 這裡對接你的國內金流 URL
                console.log("Redirecting to local payment...");
            }
        }

        // 點擊背景關閉
        window.onclick = (e) => { if(e.target.id === 'checkout-modal') closeModal(); }