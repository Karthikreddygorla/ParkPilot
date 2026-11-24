require('dotenv').config();
const path = require('path');
const express = require('express');

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

// Tell the layout which nav link is active
app.use((req, res, next) => { res.locals.path = req.path; next(); });

app.use('/', require('./routes/index'));
app.use('/spaces', require('./routes/spaces'));
app.use('/customers', require('./routes/customers'));
app.use('/vehicles', require('./routes/vehicles'));
app.use('/reservations', require('./routes/reservations'));
app.use('/search', require('./routes/search'));

app.use((req, res) => res.status(404).render('error', { title: 'Not found', message: 'That page does not exist.' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { title: 'Something went wrong', message: 'The database could not be read. Please try again.' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`ParkPilot running on http://localhost:${port}`));
