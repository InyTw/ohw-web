const roleMappings = {
        "owner": "負責伺服器的整體規劃與管理，確保伺服器運行順暢",
        "admin": "協助處理日常事務、封禁違規玩家並維護社群秩序",
        "builder-leader": "負責建築團隊的領導與協調，指導建築師完成伺服器建設",
        "builder": "負責建築團隊的管理經營，帶領團隊打造伺服器環境",
        "staff-leader": "負責基層工作人員的領導與協調，確保伺服器運作順暢",
        "staff": "基層工作人員，協助伺服器運作"
    };

document.querySelectorAll('.user-panel').forEach(panel => {
    const role = panel.getAttribute('data-role');
    const descElement = panel.querySelector('.role-description');
    
    if (roleMappings[role]) {
        descElement.innerText = roleMappings[role];
    } else {
        descElement.innerText = "歡迎加入我們的開發團隊！";
    }
});