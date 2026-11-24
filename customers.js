const router = require('express').Router();
const db = require('../db');

// Customers with how many vehicles each owns (US05)
router.get('/', async (req, res, next) => {
  try {
    const [customers] = await db.query(
      `SELECT c.customer_id, c.full_name, c.email, c.phone, COUNT(v.vehicle_id) AS vehicle_count
         FROM customers c LEFT JOIN vehicles v ON v.customer_id = c.customer_id
        GROUP BY c.customer_id ORDER BY c.full_name`);
    res.render('customers/index', { title: 'Customers', customers });
  } catch (err) { next(err); }
});

// One customer with their vehicles
router.get('/:id', async (req, res, next) => {
  try {
    const [[customer]] = await db.query('SELECT * FROM customers WHERE customer_id = ?', [req.params.id]);
    if (!customer) return res.status(404).render('error', { title: 'Not found', message: 'That customer does not exist.' });
    const [vehicles] = await db.query('SELECT * FROM vehicles WHERE customer_id = ? ORDER BY registration_number', [req.params.id]);
    res.render('customers/show', { title: customer.full_name, customer, vehicles });
  } catch (err) { next(err); }
});

module.exports = router;
