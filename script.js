// --- 1. 往下滑動時的柔和漸入動畫控制 (Intersection Observer) ---
        const fadeElements = document.querySelectorAll('.fade-in');
        const observerOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px" // 提前一點點觸發，感覺更柔和
        };

        const appearanceObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        fadeElements.forEach(el => appearanceObserver.observe(el));


        // --- 2. 導航欄捲動顯示/隱藏控制 ---
        const mainNav = document.getElementById('main-nav');
        window.addEventListener('scroll', () => {
            // 當滾動超過 150px 時顯示導航欄
            if (window.scrollY > 150) {
                mainNav.classList.add('sticky-active');
            } else {
                mainNav.classList.remove('sticky-active');
            }
        });


        // --- 3. 點擊複製 IP 功能 ---
        function copyIP(ip) {
            navigator.clipboard.writeText(ip).then(() => {
                const ipText = document.getElementById('ip-text');
                const originalText = ipText.innerText;
                ipText.innerText = "IP 複製成功！";
                ipText.style.color = "#34d399"; // 變綠色
                
                setTimeout(() => {
                    ipText.innerText = originalText;
                    ipText.style.color = "";
                }, 2000);
            }).catch(err => {
                console.error('無法複製 IP: ', err);
            });
        }


        // --- 4. 取得 Minecraft 伺服器人數 (串接 api.mcsrvstat.us 測試免費用戶端) ---
        async function fetchServerStatus() {
            const container = document.getElementById('player-count');
            // 這裡可以換成你真正的伺服器 IP (例如 play.ohw.network)
            // 目前先用 hypixel.net 做測試，讓你有畫面能看成果，改版時改成你的 IP 即可
            const targetIp = "hypixel.net"; 

            try {
                const response = await fetch(`https://api.mcsrvstat.us/2/${targetIp}`);
                const data = await response.json();

                if (data.online && data.players && data.players.online > 0) {
                    // 有人在線上
                    container.innerHTML = `
                        <span class="text-green-400 font-bold bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-full shadow-sm shadow-green-500/10">
                            ● ${data.players.online} / ${data.players.max} 在線上
                        </span>
                    `;
                } else {
                    // 沒有人在伺服器上，或者伺服器關機中
                    container.innerHTML = `
                        <span class="text-red-400 font-bold bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-full shadow-sm shadow-red-500/10">
                            ● 沒有人在伺服器喔！
                        </span>
                    `;
                }
            } catch (error) {
                // 如果 API 報錯，顯示預設沒有人
                container.innerHTML = `
                    <span class="text-red-400 font-bold bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-full">
                        ● 沒有人在伺服器喔！
                    </span>
                `;
            }
        }

        // 頁面載入後執行人數獲取
        fetchServerStatus();
        // 每 30 秒自動刷新一次人數
        setInterval(fetchServerStatus, 30000);

        // 防呆：如果圖片讀取失敗，稍微處理一下外觀
        document.querySelectorAll('.onerror-fallback').forEach(img => {
            img.onerror = function() {
                this.style.background = '#475569';
                this.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'><path fill='%23fff' d='M12 2L2 22h20L12 2z'/></svg>";
            };
        });