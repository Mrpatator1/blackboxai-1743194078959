CREATE DATABASE IF NOT EXISTS ter_bourgogne_franche_comte;
USE ter_bourgogne_franche_comte;

CREATE TABLE trains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    train_number VARCHAR(20) NOT NULL UNIQUE,
    departure_station VARCHAR(50) NOT NULL,
    arrival_station VARCHAR(50) NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    platform VARCHAR(10),
    status VARCHAR(20) DEFAULT 'À l\'heure',
    delay INT DEFAULT 0 CHECK (delay >= 0),
    reason VARCHAR(255),
    CONSTRAINT chk_status CHECK (status IN ('À l\'heure', 'Retard', 'Supprimé')),
    CONSTRAINT chk_reason CHECK (
        (status = 'Retard' AND reason IS NOT NULL) OR
        (status = 'Supprimé' AND reason IS NOT NULL) OR
        (status = 'À l\'heure')
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    train_id INT NOT NULL,
    station_name VARCHAR(50) NOT NULL,
    stop_order INT NOT NULL,
    FOREIGN KEY (train_id) REFERENCES trains(id) ON DELETE CASCADE
);

CREATE TABLE schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    train_id INT NOT NULL,
    day_of_week TINYINT NOT NULL COMMENT '0=Dimanche, 1=Lundi...',
    is_active BOOLEAN DEFAULT true,
    FOREIGN KEY (train_id) REFERENCES trains(id) ON DELETE CASCADE
);