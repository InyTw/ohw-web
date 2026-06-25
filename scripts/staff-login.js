const SUPABASE_URL = 'https://zllomerkzdmmphfcceew.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsbG9tZXJremRtbXBoZmNjZWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMzUxOTQsImV4cCI6MjA5NzcxMTE5NH0.x_0KZpvzJQBPLFccYCzz4I2aqNPBnB-t0ohjHhKSePk';
        
        // 使用 window.supabase 確保不與 CDN 載入的全域變數衝突
        const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: true,
                storageKey: 'sb-auth-token',
                storage: window.localStorage
            }
        });

        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const errorBox = document.getElementById('error-box');

            errorBox.style.display = 'none';
            errorBox.innerHTML = '';

            // 執行登入
            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

            if (error) {
                errorBox.style.display = 'block';
                const errMsg = error.message.toLowerCase();

                if (errMsg.includes('invalid login credentials')) {
                    errorBox.innerHTML = `❌ 很抱歉，系統內查無此帳號的使用授權，或是您的驗證密鑰有誤。`;
                } else if (errMsg.includes('email not confirmed')) {
                    errorBox.innerHTML = `⚠️ 該帳號尚未通過電子郵件安全核可，請聯繫 Technical_Admin。`;
                } else {
                    errorBox.innerHTML = `❌ 驗證失敗：${error.message}`;
                }
                return;
            }

            // 成功登入後緩衝跳轉
            setTimeout(() => {
                window.location.href = 'staff.html';
            }, 100);
        });