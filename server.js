import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const JWT_SECRET = process.env.JWT_SECRET || 'changeme-set-in-env';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// In-memory user store (seeded with the default admin from env)
const users = [
  {
    id: '1',
    name: 'Administrator',
    username: ADMIN_USERNAME,
    password: ADMIN_PASSWORD,
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
];

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// JWT auth middleware
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = authHeader.slice(7);
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ── Auth Routes ──────────────────────────────────────────────────────────────

// POST /api/admin/login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, username });
});

// ── User Routes (protected) ──────────────────────────────────────────────────

// GET /api/admin/users
app.get('/api/admin/users', requireAuth, (req, res) => {
  // Never send passwords to the client
  const safeUsers = users.map(({ password: _pw, ...u }) => u);
  res.json(safeUsers);
});

// POST /api/admin/users
app.post('/api/admin/users', requireAuth, (req, res) => {
  const { name, username, password, role } = req.body;
  if (!name || !username || !password) {
    return res.status(400).json({ error: 'name, username, and password are required' });
  }
  if (users.find(u => u.username === username)) {
    return res.status(409).json({ error: 'Username already exists' });
  }
  const newUser = {
    id: crypto.randomUUID(),
    name,
    username,
    password,
    role: role || 'editor',
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  const { password: _pw, ...safeUser } = newUser;
  res.status(201).json(safeUser);
});

// DELETE /api/admin/users/:id
app.delete('/api/admin/users/:id', requireAuth, (req, res) => {
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  if (users[idx].username === ADMIN_USERNAME) {
    return res.status(403).json({ error: 'Cannot delete the default admin' });
  }
  users.splice(idx, 1);
  res.json({ success: true });
});

// GET /api/admin/stats
app.get('/api/admin/stats', requireAuth, (req, res) => {
  res.json({
    totalUsers: users.length,
    adminUsers: users.filter(u => u.role === 'admin').length,
    editorUsers: users.filter(u => u.role === 'editor').length,
  });
});

// ── SPA Fallback ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is listening on 0.0.0.0:${PORT}`);
  console.log(`Admin username: ${ADMIN_USERNAME}`);
});
