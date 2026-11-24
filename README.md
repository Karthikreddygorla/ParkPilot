# ParkPilot (Sprint 3: READ pages)

## Run with Docker (easiest)
    docker compose up --build
- App: http://localhost:3000
- phpMyAdmin: http://localhost:8080 (database `parkpilot` is created from `db/init.sql`)

## Run without Docker
1. Import `db/init.sql` in phpMyAdmin.
2. `cp .env.example .env` and set your MySQL user/password.
3. `npm install` then `npm start`, and open http://localhost:3000

## Pages
| URL | What it shows | Story |
| --- | --- | --- |
| / | Space counts and upcoming reservations | US16, US18 |
| /spaces | Spaces list, filter by type and status | US02 |
| /spaces/:id | One space and its reservations | US02 |
| /customers, /customers/:id | Customers and their vehicles | US05, US06 |
| /vehicles | Vehicles with owner | US06 |
| /reservations | Reservations filtered by date, space, status | US13 |
| /search?q= | Search by name or registration | US07 |
