const express = require('express');
const bodyParser = require('body-parser');
const { Low, JSONFile } = require('lowdb');
const { nanoid } = require('nanoid');

const app = express();
const port = process.env.PORT || 3000;

// Setup LowDB
const adapter = new JSONFile('db.json');
const db = new Low(adapter);

app.use(bodyParser.json());

// Initialize DB
async function initDB() {
  await db.read();
  db.data ||= { users: [], deposits: [], withdrawals: [], referrals: [] };
  await db.write();
}
initDB();

// Register user
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  await db.read();
  if (db.data.users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }
  const user = { id: nanoid(), username, password, balance: 0, referralBonus: 0 };
  db.data.users.push(user);
  await db.write();
  res.json({ message: 'User registered successfully', user });
});

// Login user
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  await db.read();
  const user = db.data.users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  res.json({ message: 'Login successful', user });
});

// Deposit money
app.post('/deposit', async (req, res) => {
  const { userId, amount } = req.body;
  await db.read();
  const user = db.data.users.find(u => u.id === userId);
  if (!user) return res.status(400).json({ message: 'User not found' });
  user.balance += Number(amount);
  db.data.deposits.push({ id: nanoid(), userId, amount: Number(amount), date: new Date() });
  await db.write();
  res.json({ message: 'Deposit successful', balance: user.balance });
});

// Admin credentials
const admin = { username: "wenooo200", password: "Wenoo400@400" };

// Admin login
app.post('/admin-login', (req, res) => {
  const { username, password } = req.body;
  if (username === admin.username && password === admin.password) {
    return res.json({ message: 'Admin login successful' });
  }
  res.status(400).json({ message: 'Invalid admin credentials' });
});

app.listen(port, () => {
  console.log(`Nyota Fund backend running on port ${port}`);
});
