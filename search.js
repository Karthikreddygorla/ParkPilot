const router = require('express').Router();
const db = require('../db');

// Search customers and vehicles by name or registration (US07)
router.get('/', async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    let results = [];
    if (q) {
      const like = `%${q}%`;
      [results] = await db.query(
        `SELECT c.customer_id, c.full_name, c.email, v.registration_number, v.make, v.model
           FROM customers c LEFT JOIN vehicles v ON v.customer_id = c.customer_id
          WHERE c.full_name LIKE ? OR v.registration_number LIKE ?
          ORDER BY c.full_name`, [like, like]);
    }
    res.render('search', { title: 'Search', q, results });
  } catch (err) { next(err); }
});

module.exports = router;
