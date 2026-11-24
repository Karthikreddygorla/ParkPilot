const router = require('express').Router();
const db = require('../db');

// Vehicles with their owner (US06)
router.get('/', async (req, res, next) => {
  try {
    const [vehicles] = await db.query(
      `SELECT v.vehicle_id, v.registration_number, v.make, v.model, v.vehicle_type,
              c.customer_id, c.full_name
         FROM vehicles v JOIN customers c ON c.customer_id = v.customer_id
        ORDER BY v.registration_number`);
    res.render('vehicles/index', { title: 'Vehicles', vehicles });
  } catch (err) { next(err); }
});

module.exports = router;
