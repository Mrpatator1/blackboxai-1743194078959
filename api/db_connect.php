<?php
$host = '127.0.0.1'; // Utiliser 127.0.0.1 au lieu de localhost pour éviter les problèmes de résolution DNS
$db   = 'ter_bourgogne_franche_comte';
$user = 'root';
$pass = 'password'; // Remplacer par votre mot de passe MySQL
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    throw new PDOException($e->getMessage(), (int)$e->getCode());
}