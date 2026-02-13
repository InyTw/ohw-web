const CLIENT_ID = '1468282390316187813';
        const REDIRECT_URI = encodeURIComponent('https://www.ohw.cloud-ip.cc/login.html');
        
        // 構造 Discord 授權網址
        document.getElementById('login-link').href = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=identify`;

        // 檢查網址是否有 Discord 回傳的 Token
        window.onload = () => {
            const fragment = new URLSearchParams(window.location.hash.slice(1));
            const accessToken = fragment.get('access_token');

            if (accessToken) {
                // 拿到 Token 後，去跟 Discord 換玩家資料
                fetch('https://discord.com/api/users/@me', {
                    headers: { authorization: `Bearer ${accessToken}` }
                })
                .then(res => res.json())
                .then(user => {
                    // 儲存玩家資料
                    localStorage.setItem('discord_user', JSON.stringify(user));
                    window.location.href = 'dashboard.html';
                });
            }
        };