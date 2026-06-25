const SUPABASE_URL = 'https://zllomerkzdmmphfcceew.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsbG9tZXJremRtbXBoZmNjZWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMzUxOTQsImV4cCI6MjA5NzcxMTE5NH0.x_0KZpvzJQBPLFccYCzz4I2aqNPBnB-t0ohjHhKSePk'; 
        const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        async function loadNews() {
            const { data: news, error } = await supabase
                .from('news')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) { console.error(error); return; }

            const container = document.getElementById('news-container');
            container.innerHTML = '';

            news.forEach(item => {
                const card = document.createElement('div');
                card.className = 'news-card';
                
                // 這裡處理圖片：如果 cover 有資料，就直接作為背景圖顯示
                // 因為 Base64 字串可以直接塞在 style 的 url() 裡
                const coverStyle = item.cover ? `background-image: url('${item.cover}');` : '';

                card.innerHTML = `
                    <div class="news-cover" style="${coverStyle}"></div>
                    <div class="news-body">
                        <div class="category">${item.category}</div>
                        <h2 class="title">${item.title}</h2>
                        <div class="content">${item.content}</div>
                        <div class="footer">發佈者: ${item.author} | ${new Date(item.created_at).toLocaleDateString()}</div>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        loadNews();