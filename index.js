const router = require('express').Router();
const db = require('../db');

// Dashboard: counts of spaces by status + next reservations (US16, US18)
router.get('/', async (req, res, next) => {
  try {
    const [counts] = await db.query(
      `SELECT operational_status AS status, COUNT(*) AS total FROM parking_spaces GROUP BY operational_status`);
    const byStatus = { AVAILABLE: 0, MAINTENANCE: 0, OUT_OF_SERVICE: 0 };
    counts.forEach(c => { byStatus[c.status] = c.total; });
    const total = Object.values(byStatus).reduce((a, b) => a + b, 0);

    const [upcoming] = await db.query(
      `SELECT r.reservation_id, r.start_time, r.end_time, r.status, s.space_code, v.registration_number
         FROM reservations r
         JOIN parking_spaces s ON s.space_id = r.space_id
         JOIN vehicles v ON v.vehicle_id = r.vehicle_id
        WHERE r.status <> 'CANCELLED'
        ORDER BY r.start_time LIMIT 10`);
    res.render('index', { title: 'Dashboard', total, byStatus, upcoming });
  } catch (err) { next(err); }
});

module.exports = router;
