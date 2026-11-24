-- ParkPilot database: schema + sample data
-- Works in phpMyAdmin (Import tab, or paste into the SQL tab). Needs MySQL 8.0.16+ or MariaDB 10.2+ for CHECK.
-- WARNING: drops and recreates these five tables.

CREATE DATABASE IF NOT EXISTS parkpilot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE parkpilot;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS parking_sessions;
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS parking_spaces;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS customers;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE customers (
    customer_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name   VARCHAR(120) NOT NULL,
    email       VARCHAR(150) NOT NULL,
    phone       VARCHAR(30)  NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_customers_email UNIQUE (email)
) ENGINE=InnoDB;

CREATE TABLE vehicles (
    vehicle_id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id         INT UNSIGNED NOT NULL,
    registration_number VARCHAR(20)  NOT NULL,
    make                VARCHAR(50)  NULL,
    model               VARCHAR(50)  NULL,
    vehicle_type        ENUM('CAR','MOTORBIKE','VAN','EV') NOT NULL DEFAULT 'CAR',
    CONSTRAINT uq_vehicles_registration UNIQUE (registration_number),
    CONSTRAINT fk_vehicles_customer FOREIGN KEY (customer_id)
        REFERENCES customers (customer_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE parking_spaces (
    space_id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    space_code         VARCHAR(10) NOT NULL,
    space_type         ENUM('STANDARD','ACCESSIBLE','EV') NOT NULL DEFAULT 'STANDARD',
    operational_status ENUM('AVAILABLE','MAINTENANCE','OUT_OF_SERVICE') NOT NULL DEFAULT 'AVAILABLE',
    location_label     VARCHAR(80) NULL,
    CONSTRAINT uq_spaces_code UNIQUE (space_code)
) ENGINE=InnoDB;

CREATE TABLE reservations (
    reservation_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vehicle_id     INT UNSIGNED NOT NULL,
    space_id       INT UNSIGNED NOT NULL,
    start_time     DATETIME NOT NULL,
    end_time       DATETIME NOT NULL,
    status         ENUM('PENDING','CONFIRMED','CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_res_times CHECK (end_time > start_time),
    CONSTRAINT fk_res_vehicle FOREIGN KEY (vehicle_id)
        REFERENCES vehicles (vehicle_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_res_space FOREIGN KEY (space_id)
        REFERENCES parking_spaces (space_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_res_overlap (space_id, start_time, end_time)
) ENGINE=InnoDB;

CREATE TABLE parking_sessions (
    session_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT UNSIGNED NOT NULL,
    check_in_time  DATETIME NOT NULL,
    check_out_time DATETIME NULL,
    session_status ENUM('ACTIVE','COMPLETED') NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT uq_session_reservation UNIQUE (reservation_id),
    CONSTRAINT chk_session_times CHECK (check_out_time IS NULL OR check_out_time >= check_in_time),
    CONSTRAINT fk_session_reservation FOREIGN KEY (reservation_id)
        REFERENCES reservations (reservation_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------- sample data
INSERT INTO customers (full_name, email, phone) VALUES
 ('Rahul Sharma',  'rahul.sharma@example.com', '07700 900101'),
 ('Sita Ram',      'sita.ram@example.com',     '07700 900102'),
 ('Emma Clarke',   'emma.clarke@example.com',  '07700 900103'),
 ('Daniel Okoye',  'daniel.okoye@example.com', '07700 900104');

INSERT INTO vehicles (customer_id, registration_number, make, model, vehicle_type) VALUES
 (1, 'AB12 CDE', 'Toyota', 'Corolla', 'CAR'),
 (2, 'LK70 XYZ', 'Nissan', 'Leaf',    'EV'),
 (3, 'MN21 FGH', 'Ford',   'Transit', 'VAN'),
 (4, 'PQ19 JKL', 'Honda',  'CB500F',  'MOTORBIKE');

INSERT INTO parking_spaces (space_code, space_type, operational_status, location_label) VALUES
 ('A01', 'STANDARD',   'AVAILABLE',      'Level 1'),
 ('A02', 'STANDARD',   'AVAILABLE',      'Level 1'),
 ('A03', 'ACCESSIBLE', 'AVAILABLE',      'Level 1'),
 ('A04', 'STANDARD',   'MAINTENANCE',    'Level 1'),
 ('B01', 'EV',         'AVAILABLE',      'Level 2'),
 ('B02', 'EV',         'AVAILABLE',      'Level 2'),
 ('B03', 'STANDARD',   'OUT_OF_SERVICE', 'Level 2');

INSERT INTO reservations (vehicle_id, space_id, start_time, end_time, status) VALUES
 (1, 1, '2026-11-16 09:00:00', '2026-11-16 11:00:00', 'CONFIRMED'),
 (1, 1, '2026-11-16 11:00:00', '2026-11-16 13:00:00', 'CONFIRMED'),
 (2, 5, '2026-11-16 10:00:00', '2026-11-16 14:00:00', 'CONFIRMED'),
 (3, 2, '2026-11-17 08:00:00', '2026-11-17 18:00:00', 'PENDING'),
 (4, 3, '2026-11-17 09:00:00', '2026-11-17 10:00:00', 'CANCELLED');

INSERT INTO parking_sessions (reservation_id, check_in_time, check_out_time, session_status) VALUES
 (1, '2026-11-16 08:55:00', '2026-11-16 10:50:00', 'COMPLETED');

-- ---------------------------------------------------------------- READ queries for your Pug pages
-- Spaces list with filters (US02):
--   SELECT * FROM parking_spaces WHERE (? IS NULL OR space_type = ?) AND (? IS NULL OR operational_status = ?) ORDER BY space_code;
-- Vehicles with their owner (US06):
--   SELECT v.*, c.full_name FROM vehicles v JOIN customers c ON c.customer_id = v.customer_id ORDER BY v.registration_number;
-- Search customers and vehicles (US07):
--   SELECT c.full_name, c.email, v.registration_number FROM customers c LEFT JOIN vehicles v ON v.customer_id = c.customer_id
--   WHERE c.full_name LIKE CONCAT('%', ?, '%') OR v.registration_number LIKE CONCAT('%', ?, '%');
