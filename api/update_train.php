<?php
header("Content-Type: application/json");
require_once 'db_connect.php';

$data = json_decode(file_get_contents('php://input'), true);

try {
    $pdo->beginTransaction();
    
    // Mettre à jour le train
    $stmt = $pdo->prepare("UPDATE trains SET 
                          train_number = ?,
                          departure_station = ?,
                          arrival_station = ?,
                          departure_time = ?,
                          arrival_time = ?,
                          platform = ?
                          WHERE id = ?");
    $stmt->execute([
        $data['train_number'],
        $data['departure_station'],
        $data['arrival_station'],
        $data['departure_time'],
        $data['arrival_time'],
        $data['platform'],
        $data['train_id']
    ]);
    
    // Supprimer les anciennes gares
    $stmt = $pdo->prepare("DELETE FROM stops WHERE train_id = ?");
    $stmt->execute([$data['train_id']]);
    
    // Ajouter les nouvelles gares
    $stmt = $pdo->prepare("INSERT INTO stops (train_id, station_name, stop_order) VALUES (?, ?, ?)");
    foreach ($data['stops'] as $order => $station) {
        $stmt->execute([$data['train_id'], $station, $order]);
    }
    
    // Supprimer les anciens jours
    $stmt = $pdo->prepare("DELETE FROM schedules WHERE train_id = ?");
    $stmt->execute([$data['train_id']]);
    
    // Ajouter les nouveaux jours
    $stmt = $pdo->prepare("INSERT INTO schedules (train_id, day_of_week) VALUES (?, ?)");
    foreach ($data['days'] as $day) {
        $stmt->execute([$data['train_id'], $day]);
    }
    
    $pdo->commit();
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}