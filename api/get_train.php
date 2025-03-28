<?php
header("Content-Type: application/json");
require_once 'db_connect.php';

$train_id = $_GET['id'] ?? null;

if (!$train_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'ID de train manquant']);
    exit;
}

try {
    // Récupérer le train
    $stmt = $pdo->prepare("SELECT * FROM trains WHERE id = ?");
    $stmt->execute([$train_id]);
    $train = $stmt->fetch();
    
    if (!$train) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Train non trouvé']);
        exit;
    }
    
    // Récupérer les gares
    $stmt = $pdo->prepare("SELECT station_name, stop_order FROM stops WHERE train_id = ? ORDER BY stop_order");
    $stmt->execute([$train_id]);
    $stops = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);
    
    // Récupérer les jours
    $stmt = $pdo->prepare("SELECT day_of_week FROM schedules WHERE train_id = ?");
    $stmt->execute([$train_id]);
    $days = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);
    
    echo json_encode([
        'success' => true,
        'train' => $train,
        'stops' => $stops,
        'days' => $days
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}