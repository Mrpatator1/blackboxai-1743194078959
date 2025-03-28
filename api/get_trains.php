<?php
header("Content-Type: application/json");
require_once 'db_connect.php';

try {
    // Récupération des trains avec leurs gares et horaires
    $query = "SELECT t.*, 
              GROUP_CONCAT(s.station_name ORDER BY s.stop_order SEPARATOR '|') as stops,
              GROUP_CONCAT(sc.day_of_week SEPARATOR ',') as days
              FROM trains t
              LEFT JOIN stops s ON t.id = s.train_id
              LEFT JOIN schedules sc ON t.id = sc.train_id
              GROUP BY t.id";

    $stmt = $pdo->query($query);
    $trains = $stmt->fetchAll();

    // Formatage des données
    $formatted = array_map(function($train) {
        return [
            'train' => $train['train_number'],
            'departure' => [
                'station' => $train['departure_station'],
                'time' => $train['departure_time']
            ],
            'arrival' => [
                'station' => $train['arrival_station'],
                'time' => $train['arrival_time']
            ],
            'stops' => explode('|', $train['stops']),
            'duration' => calculateDuration($train['departure_time'], $train['arrival_time']),
            'status' => 'À l\'heure', // À implémenter avec des données réelles
            'platform' => $train['platform'],
            'days' => explode(',', $train['days'])
        ];
    }, $trains);

    echo json_encode($formatted);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

function calculateDuration($start, $end) {
    $start = new DateTime($start);
    $end = new DateTime($end);
    $diff = $start->diff($end);
    return $diff->h . 'h' . str_pad($diff->i, 2, '0', STR_PAD_LEFT);
}