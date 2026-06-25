const supabase = window.supabase.createClient('https://zllomerkzdmmphfcceew.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsbG9tZXJremRtbXBoZmNjZWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMzUxOTQsImV4cCI6MjA5NzcxMTE5NH0.x_0KZpvzJQBPLFccYCzz4I2aqNPBnB-t0ohjHhKSePk');

        document.getElementById('apply-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('submit-btn');
            
            // 加入長度檢查 (50字)
            if (document.getElementById('bio').value.length < 50) {
                alert('⚠️ 請詳細說明您的資歷 (需滿 50 字)');
                return;
            }

            btn.disabled = true;
            btn.innerText = '提交中...';

            const data = {
                mc_id: document.getElementById('mc-id').value,
                dc_id: document.getElementById('dc-id').value,
                email: document.getElementById('email').value,
                role: document.getElementById('role').value,
                bio: document.getElementById('bio').value
            };

            const { error } = await supabase.from('applications').insert([data]);
            
            if (error) {
                alert('發送失敗: ' + error.message);
                btn.disabled = false;
                btn.innerText = '提交審查單';
            } else {
                alert('📬 申請已成功送出！');
                e.target.reset();
                btn.disabled = false;
                btn.innerText = '提交審查單';
            }
        });