<?php
header("Content-Type: application/json");
require_once 'db_connect.php';

// Vérifier que la requête est POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(['success' => false, 'error' => 'Méthode non autorisée']));
}

// Récupérer et valider les données JSON
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    die(json_encode(['success' => false, 'error' => 'Données JSON invalides']));
}

// Validation des données requises
$required = ['train_number', 'departure_station', 'arrival_station', 'departure_time', 'arrival_time', 'stops', 'days', 'status'];

// Validation supplémentaire si retard
if (isset($data['status']) && $data['status'] === 'Retard') {
    if (empty($data['delay']) || !is_numeric($data['delay']) || $data['delay'] < 0) {
        http_response_code(400);
        die(json_encode(['success' => false, 'error' => 'Un retard doit avoir une durée valide (nombre positif)']));
    }
    if (empty($data['reason'])) {
        http_response_code(400);
        die(json_encode(['success' => false, 'error' => 'Un motif doit être spécifié pour un retard']));
    }
}

// Validation supplémentaire si supprimé
if (isset($data['status']) && $data['status'] === 'Supprimé' && empty($data['reason'])) {
    http_response_code(400);
    die(json_encode(['success' => false, 'error' => 'Un motif doit être spécifié pour une suppression']));
}
foreach ($required as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        die(json_encode(['success' => false, 'error' => "Le champ $field est requis"]));
    }
}

try {
    $pdo->beginTransaction();
    
    // 1. Insertion du train
    $stmt = $pdo->prepare("INSERT INTO trains (train_number, departure_station, arrival_station, departure_time, arrival_time, platform, status, delay, reason) 
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $data['train_number'],
        $data['departure_station'],
        $data['arrival_station'],
        $data['departure_time'],
        $data['arrival_time'],
        $data['platform'] ?? null,
        $data['status'] ?? 'À l\'heure',
        $data['delay'] ?? 0,
        $data['reason'] ?? null
    ]);
    $train_id = $pdo->lastInsertId();
    
    // 2. Insertion des gares
    $stmt = $pdo->prepare("INSERT INTO stops (train_id, station_name, stop_order) VALUES (?, ?, ?)");
    foreach ($data['stops'] as $order => $station) {
        if (empty($station)) {
            throw new Exception("Nom de gare invalide à la position $order");
        }
        $stmt->execute([$train_id, trim($station), $order]);
    }
    
    // 3. Insertion des jours de circulation
    $stmt = $pdo->prepare("INSERT INTO schedules (train_id, day_of_week) VALUES (?, ?)");
    foreach ($data['days'] as $day) {
        if (!is_numeric($day) || $day < 0 || $day > 6) {
            throw new Exception("Jour de circulation invalide: $day");
        }
        $stmt->execute([$train_id, $day]);
    }
    
    $pdo->commit();
    
    echo json_encode([
        'success' => true, 
        'train_id' => $train_id,
        'train_number' => $data['train_number'],
        'departure_station' => $data['departure_station'],
        'arrival_station' => $data['arrival_station'],
        'status' => $data['status'],
        'delay' => $data['delay'] ?? 0,
        'message' => 'Train ajouté avec succès',
        'details' => [
            'départ' => $data['departure_time'],
            'arrivée' => $data['arrival_time'],
            'quai' => $data['platform'] ?? 'Non spécifié'
        ]
    ]);
    
} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur serveur: ' . $e->getMessage(),
        'code' => $e->getCode()
    ]);
}