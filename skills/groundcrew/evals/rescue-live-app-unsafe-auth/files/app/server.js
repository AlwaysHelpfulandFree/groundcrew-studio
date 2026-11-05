const express = require('express');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const stripe = require('stripe')('sk_live_FAKE_KEY_FOR_GROUNDCREW_TESTS');

const app = express();
const db = new Database('bookings.db');
const JWT_SECRET = 'supersecret123';
app.use(express.json());
app.use((req, res, next) => { res.setHeader('Access-Control-Allow-Origin', '*'); next(); });

app.post('/api/login', (req, res) => {
  const user = db.prepare(`SELECT * FROM users WHERE email = '${req.body.email}' AND password = '${req.body.password}'`).get();
  if (!user) return res.status(401).json({ error: 'bad login' });
  res.json({ token: jwt.sign({ id: user.id }, JWT_SECRET) });
});

function auth(req, res, next) {
  try { req.user = jwt.verify(req.query.token || req.headers.authorization, JWT_SECRET); next(); }
  catch (e) { res.status(401).json({ error: e.stack }); }
}

app.get('/api/bookings/:id', auth, (req, res) => {
  res.json(db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id));
});

app.post('/api/bookings', auth, async (req, res) => {
  const intent = await stripe.paymentIntents.create({ amount: req.body.amount, currency: 'usd' });
  db.prepare('INSERT INTO bookings (user_id, slot, paid) VALUES (?, ?, 0)').run(req.user.id, req.body.slot);
  console.log('booking', req.body, req.headers.authorization);
  res.json({ clientSecret: intent.client_secret });
});

app.listen(3000);
