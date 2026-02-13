<?php
header('Content-Type: application/json');

// --- 資料庫連線 ---
$conn = new mysqli("localhost", "root", "ohw-db-1234", "OHW-web");

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "連線失敗"]));
}

$discordID = $_POST['discordID'];
$username = $_POST['username'];

// 1. 檢查玩家上次領取時間
$stmt = $conn->prepare("SELECT last_claim_time FROM daily_rewards WHERE discord_id = ?");
$stmt->bind_param("s", $discordID);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

$canClaim = false;
if (!$row) {
    $canClaim = true; // 從來沒領過
} else {
    $lastTime = strtotime($row['last_claim_time']);
    // 檢查是否已經過了一天 (86400秒)
    if ((time() - $lastTime) >= 86400) {
        $canClaim = true;
    }
}

// 2. 執行發放
if ($canClaim) {
    // 更新或插入領取時間
    $stmt = $conn->prepare("REPLACE INTO daily_rewards (discord_id, last_claim_time) VALUES (?, NOW())");
    $stmt->bind_param("s", $discordID);
    $stmt->execute();

    // 這裡可以順便寫入你原本給錢的指令，或者發送 Webhook 
    echo json_encode(["success" => true, "message" => "10 OHW-Coins 已發放！"]);
} else {
    echo json_encode(["success" => false, "message" => "冷卻中，請明天再領。"]);
}

$conn->close();
?>