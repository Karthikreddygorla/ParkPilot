const router = require('express').Router();
const db = require('../db');

const TYPES = ['STANDARD', 'ACCESSIBLE', 'EV'];
const STATUSES = ['AVAILABLE', 'MAINTENANCE', 'OUT_OF_SERVICE'];

// List and filter parking spaces (US02)
router.get('/', async (req, res, next) => {
  try {
    // Only accept known values, so odd input is ignored
    const type = TYPES.includes(req.query.type) ? req.query.type : '';
    const status = STATUSES.includes(req.query.status) ? req.query.status : '';

    const where = [], params = [];
    if (type) { where.push('space_type = ?'); params.push(type); }
    if (status) { where.push('operational_status = ?'); params.push(status); }

    const [spaces] = await db.query(
      `SELECT space_id, space_code, space_type, operational_status, location_label
         FROM parking_spaces ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
        ORDER BY space_code`, params);
    res.render('spaces/index', { title: 'Parking spaces', spaces, type, status, TYPES, STATUSES });
  } catch (err) { next(err); }
});

// One space with its upcoming reservations
router.get('/:id', async (req, res, next) => {
  try {
    const [[space]] = await db.query('SELECT * FROM parking_spaces WHERE space_id = ?', [req.params.id]);
    if (!space) return res.status(404).render('error', { title: 'Not found', message: 'That space does not exist.' });
    const [reservations] = await db.query(
      `SELECT r.*, v.registration_number FROM reservations r
         JOIN vehicles v ON v.vehicle_id = r.vehicle_id
        WHERE r.space_id = ? ORDER BY r.start_time`, [req.params.id]);
    res.render('spaces/show', { title: `Space ${space.space_code}`, space, reservations });
  } catch (err) { next(err); }
});

module.exports = router;
