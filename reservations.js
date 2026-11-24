const router = require('express').Router();
const db = require('../db');

const STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED'];

// Reservations filtered by date, space and status (US13)
router.get('/', async (req, res, next) => {
  try {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(req.query.date || '') ? req.query.date : '';
    const space = /^\d+$/.test(req.query.space || '') ? req.query.space : '';
    const status = STATUSES.includes(req.query.status) ? req.query.status : '';

    const where = [], params = [];
    if (date) { where.push('DATE(r.start_time) = ?'); params.push(date); }
    if (space) { where.push('r.space_id = ?'); params.push(space); }
    if (status) { where.push('r.status = ?'); params.push(status); }

    const [reservations] = await db.query(
      `SELECT r.reservation_id, r.start_time, r.end_time, r.status, s.space_code, v.registration_number, c.full_name
         FROM reservations r
         JOIN parking_spaces s ON s.space_id = r.space_id
         JOIN vehicles v ON v.vehicle_id = r.vehicle_id
         JOIN customers c ON c.customer_id = v.customer_id
        ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
        ORDER BY r.start_time`, params);
    const [spaces] = await db.query('SELECT space_id, space_code FROM parking_spaces ORDER BY space_code');
    res.render('reservations/index', { title: 'Reservations', reservations, spaces, date, space, status, STATUSES });
  } catch (err) { next(err); }
});

module.exports = router;
